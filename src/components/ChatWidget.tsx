import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { MessageSquare, X, Send, Bot, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Cookies from 'js-cookie';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const CHAT_SESSION_KEY = 'ryoko_chat_session_id';
const ANON_ID_KEY = 'ryoko_anon_id';

// Generate or retrieve a persistent anonymous ID
function getOrCreateAnonId(): string {
    let anonId = Cookies.get(ANON_ID_KEY);
    if (!anonId) {
        anonId = `anon_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        Cookies.set(ANON_ID_KEY, anonId, { expires: 365 });
    }
    return anonId;
}

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [chatError, setChatError] = useState<string | null>(null);
    const { user } = useAuth();
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            initSession();
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const initSession = async () => {
        setChatError(null);
        let sId = Cookies.get(CHAT_SESSION_KEY);
        if (sId) {
            // Check if existing session in cookie is compatible with current auth state
            const { data: sessionData } = await supabase
                .from('chat_sessions')
                .select('user_id, anon_id')
                .eq('id', sId)
                .single();

            if (sessionData) {
                const belongsToCurrentUser = user ? sessionData.user_id === user.id : !!sessionData.anon_id;
                if (!belongsToCurrentUser) {
                    console.log('Session mismatch with auth state. Starting fresh.');
                    sId = null;
                    Cookies.remove(CHAT_SESSION_KEY);
                }
            } else {
                // Session doesn't exist in DB anymore
                sId = null;
                Cookies.remove(CHAT_SESSION_KEY);
            }
        }

        if (!sId) {
            const anonId = user ? null : getOrCreateAnonId();

            const { data, error } = await supabase
                .from('chat_sessions')
                .insert({
                    user_id: user?.id || null,
                    anon_id: anonId,
                })
                .select()
                .single();

            if (error || !data) {
                console.error('Session creation failed:', error);
                // If it's a conflict or forbidden, try clearing the cookie and starting fresh
                if (error?.code === '409' || error?.code === 'P0001' || error?.code === '403') {
                    Cookies.remove(CHAT_SESSION_KEY);
                }
                setChatError('Could not start chat session. Please refresh the page.');
                return;
            }

            sId = data.id;
            Cookies.set(CHAT_SESSION_KEY, sId, { expires: 7 });
        }

        // Validate that sId is a UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(sId)) {
            console.error('Invalid session ID format:', sId);
            Cookies.remove(CHAT_SESSION_KEY);
            setChatError('Session corrupted. Refreshing...');
            window.location.reload();
            return;
        }

        setSessionId(sId);
        loadMessages(sId);
        subscribeToMessages(sId);
    };

    const loadMessages = async (sId: string) => {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Failed to load messages:', error);
        } else if (data) {
            setMessages(data);
        }
    };

    const subscribeToMessages = (sId: string) => {
        const channel = supabase
            .channel(`chat:${sId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `session_id=eq.${sId}`
            }, (payload) => {
                setMessages(prev => {
                    if (prev.find(m => m.id === payload.new.id)) return prev;
                    return [...prev, payload.new];
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!message.trim() || loading) return;
        if (!sessionId) {
            setChatError('Session not initialized. Please wait a moment.');
            return;
        }


        const userMsg = message.trim();
        setMessage('');
        setLoading(true);
        setChatError(null);

        // Optimistically show user message
        const tempMsg = { id: `temp_${Date.now()}`, sender_role: 'user', content: userMsg, created_at: new Date().toISOString() };
        setMessages(prev => [...prev, tempMsg]);

        try {
            // 1. Insert user message to DB
            const { error: insertError } = await supabase.from('chat_messages').insert({
                session_id: sessionId,
                sender_role: 'user',
                content: userMsg
            });

            if (insertError) {
                console.error('Message insert error:', insertError);
                // Don't throw— still try calling the AI
            }

            // 2. Call AI Bot Edge Function
            setIsTyping(true);
            const { data, error: fnError } = await supabase.functions.invoke('chat-bot', {
                body: {
                    message: userMsg,
                    sessionId,
                    history: messages.slice(-6).map(m => ({ role: m.sender_role, content: m.content }))
                }
            });

            if (fnError) throw new Error(fnError.message || 'AI function failed');

            // The AI response will come via real-time subscription OR we add it manually
            if (data?.content) {
                setMessages(prev => {
                    const alreadyAdded = prev.find(m => m.content === data.content && m.sender_role === 'assistant');
                    if (alreadyAdded) return prev;
                    return [...prev, {
                        id: `ai_${Date.now()}`,
                        sender_role: 'assistant',
                        content: data.content,
                        created_at: new Date().toISOString()
                    }];
                });
            }

        } catch (err: any) {
            console.error('Chat error:', err);
            setChatError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-6 z-[100] font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-between text-white flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                    <Bot className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold leading-none">Ryoko Assistant</h3>
                                    <p className="text-[10px] opacity-80 uppercase tracking-widest font-black mt-1">Always Active</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10 rounded-full">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#0a0a0a]"
                        >
                            {messages.length === 0 && !isTyping && !chatError && (
                                <div className="text-center py-10 px-6">
                                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-amber-500/20">
                                        <Bot className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">Karibu!</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        I'm your Ryoko guide. How can I help you plan your journey through Kenya today?
                                    </p>
                                </div>
                            )}

                            {chatError && (
                                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl text-sm text-red-600 dark:text-red-400">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{chatError}</span>
                                </div>
                            )}

                            {messages.map((m, i) => (
                                <div
                                    key={m.id || i}
                                    className={`flex ${m.sender_role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`
                    max-w-[85%] p-3 rounded-2xl text-sm
                    ${m.sender_role === 'user'
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-tr-none'
                                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm border border-slate-200 dark:border-white/5 rounded-tl-none'}
                  `}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-white/5 flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5 flex-shrink-0">
                            <div className="relative group">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSendMessage(); }}
                                    placeholder="Ask about tours, safaris..."
                                    disabled={loading}
                                    className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-slate-800 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none text-slate-800 dark:text-white disabled:opacity-60"
                                />
                                <Button
                                    type="submit"
                                    disabled={!message.trim() || loading}
                                    className="absolute right-1.5 top-1.5 w-9 h-9 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl flex items-center justify-center p-0 hover:opacity-90 transition-all disabled:opacity-40"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </Button>
                            </div>
                            <p className="text-[10px] text-center text-slate-400 mt-2">Powered by Ryoko AI</p>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          w-16 h-16 rounded-full shadow-luxury transition-all duration-500 group overflow-hidden border-none relative
          ${isOpen ? 'bg-slate-900 dark:bg-white rotate-90 scale-90' : 'bg-gradient-to-br from-amber-500 to-orange-600 hover:-translate-y-1'}
        `}
            >
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {isOpen ? (
                    <X className={`w-8 h-8 ${isOpen ? 'text-white dark:text-slate-900' : 'text-white'}`} />
                ) : (
                    <MessageSquare className="w-8 h-8 text-white" />
                )}
            </Button>
        </div>
    );
};

export default ChatWidget;
