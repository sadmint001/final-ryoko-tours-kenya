import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, User, Bot, Clock, Search, Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

const SupportDashboard = () => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [reply, setReply] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSessions();
        const channel = supabase
            .channel('public:chat_sessions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_sessions' }, () => {
                fetchSessions();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        if (selectedSessionId) {
            loadMessages(selectedSessionId);
            const msgChannel = supabase
                .channel(`admin:chat:${selectedSessionId}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `session_id=eq.${selectedSessionId}`
                }, (payload) => {
                    setMessages(prev => [...prev, payload.new]);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(msgChannel);
            };
        }
    }, [selectedSessionId]);

    const fetchSessions = async () => {
        const { data, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .order('last_message_at', { ascending: false });

        if (data) setSessions(data);
        setLoading(false);
    };

    const loadMessages = async (sId: string) => {
        const { data } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sId)
            .order('created_at', { ascending: true });

        if (data) setMessages(data);
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim() || !selectedSessionId) return;

        try {
            const { error } = await supabase.from('chat_messages').insert({
                session_id: selectedSessionId,
                sender_role: 'admin',
                content: reply.trim()
            });

            if (error) throw error;
            setReply('');
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to send reply', variant: 'destructive' });
        }
    };

    const filteredSessions = sessions.filter(s =>
        s.id.includes(searchTerm) || (s.anon_id && s.anon_id.includes(searchTerm))
    );

    return (
        <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
            {/* Session List */}
            <div className="lg:col-span-4 flex flex-col space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search sessions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none"
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {filteredSessions.map(session => (
                        <button
                            key={session.id}
                            onClick={() => setSelectedSessionId(session.id)}
                            className={`
                w-full text-left p-4 rounded-2xl transition-all border
                ${selectedSessionId === session.id
                                    ? 'bg-white dark:bg-[#1a1a1a] border-amber-500 shadow-lg'
                                    : 'bg-white/50 dark:bg-white/5 border-transparent hover:border-slate-200 dark:hover:border-white/10'}
              `}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant={session.status === 'active' ? 'default' : 'outline'} className="text-[10px]">
                                    {session.status}
                                </Badge>
                                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                    <Clock className="w-3 h-3" />
                                    {formatDistanceToNow(new Date(session.last_message_at))} ago
                                </div>
                            </div>
                            <p className="text-sm font-bold truncate">Session {session.id.slice(0, 8)}</p>
                            <p className="text-xs text-slate-500 truncate mt-1">
                                {session.anon_id || session.user_id ? 'Authenticated' : 'Guest'} User
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat View */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl flex flex-col overflow-hidden">
                {selectedSessionId ? (
                    <>
                        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Session {selectedSessionId.slice(0, 8)}</h3>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Live Support Chat</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-[#0a0a0a]">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-3 max-w-[80%] ${m.sender_role === 'admin' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${m.sender_role === 'admin' ? 'bg-amber-500' : 'bg-slate-200 dark:bg-white/10'
                                            }`}>
                                            {m.sender_role === 'admin' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4" />}
                                        </div>
                                        <div className={`
                      p-3 rounded-2xl text-sm shadow-sm
                      ${m.sender_role === 'admin'
                                                ? 'bg-amber-500 text-white rounded-tr-none'
                                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-white/5 rounded-tl-none'}
                    `}>
                                            <p className="font-bold text-[10px] uppercase tracking-widest opacity-70 mb-1">
                                                {m.sender_role}
                                            </p>
                                            {m.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSendReply} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5 flex gap-2">
                            <input
                                type="text"
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                placeholder="Type your response..."
                                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none"
                            />
                            <Button type="submit" className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl px-6">
                                <Send className="w-4 h-4 mr-2" /> Send
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <MessageSquare className="w-10 h-10 text-slate-300 dark:text-white/10" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Session Selected</h3>
                        <p className="text-slate-500 max-w-sm">
                            Select a chat session from the left to monitor AI interactions or take over from the bot.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportDashboard;
