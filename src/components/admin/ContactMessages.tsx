import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Clock, Trash2, CheckCircle, XCircle, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Loader from '@/components/ui/loader';

interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at: string;
    status: 'unread' | 'read' | 'replied';
}

const ContactMessages = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        fetchMessages();

        const channel = supabase
            .channel('public:contact_messages')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, fetchMessages)
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, []);

    const fetchMessages = async () => {
        try {
            const { data, error } = await supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
            // Don't show toast on 404 table not found to avoid annoyance if DB not ready
        } finally {
            setLoading(false);
        }
    };

    const deleteMessage = async (id: number) => {
        try {
            const { error } = await supabase
                .from('contact_messages')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setMessages(messages.filter(m => m.id !== id));
            toast({ title: "Message deleted" });
        } catch (error) {
            toast({ title: "Error deleting message", variant: "destructive" });
        }
    };

    const markAsRead = async (id: number, currentStatus: string) => {
        if (currentStatus !== 'unread') return;
        try {
            const { error } = await supabase
                .from('contact_messages')
                .update({ status: 'read' })
                .eq('id', id);

            if (error) throw error;

            setMessages(messages.map(m => m.id === id ? { ...m, status: 'read' } : m));
        } catch (error) {
            console.error(error);
        }
    };

    const filteredMessages = messages.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <Loader label="Loading messages..." />;

    if (messages.length === 0) {
        return (
            <div className="text-center py-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-800 dark:text-white">No messages yet</h3>
                <p className="text-slate-500 dark:text-slate-400">When customers contact you, their messages will appear here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <h2 className="text-2xl font-bold font-serif text-slate-800 dark:text-white">Inbox ({messages.length})</h2>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                </div>
            </div>

            <div className="grid gap-4">
                {filteredMessages.map((msg) => (
                    <Card
                        key={msg.id}
                        className={`
              transition-all duration-300 hover:shadow-lg border-l-4 
              ${msg.status === 'unread' ? 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10' : 'border-l-transparent bg-white dark:bg-slate-800'}
            `}
                    >
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-4 justify-between md:items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">{msg.subject}</h3>
                                        {msg.status === 'unread' && (
                                            <Badge className="bg-amber-500 text-white hover:bg-amber-600">New</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{msg.name}</span>
                                        <span>&bull;</span>
                                        <span>{msg.email}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Clock className="w-4 h-4" />
                                    {format(new Date(msg.created_at), 'MMM d, yyyy h:mm a')}
                                </div>
                            </div>

                            <div className="bg-white/50 dark:bg-slate-900/50 p-4 rounded-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                {msg.message}
                            </div>

                            <div className="flex justify-end gap-2">
                                {msg.status === 'unread' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => markAsRead(msg.id, msg.status)}
                                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Mark as Read
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteMessage(msg.id)}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-slate-800 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-200"
                                    onClick={() => window.location.href = `mailto:${msg.email}?subject=Re: ${msg.subject}`}
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    Reply
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ContactMessages;
