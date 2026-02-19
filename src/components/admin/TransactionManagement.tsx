import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Loader2,
    CreditCard,
    Search,
    ExternalLink,
    User,
    Mail,
    Phone,
    RefreshCcw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
    id: string;
    order_tracking_id: string;
    merchant_reference: string;
    amount: number;
    currency: string;
    status: string;
    payment_method: string;
    created_at: string;
    booking_id: string | null;
    booking?: {
        customer_name: string;
        customer_email: string;
        customer_phone: string;
        tour_id: string;
    };
}

const TransactionManagement = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        fetchTransactions();

        // Set up real-time listener for status changes
        const channel = supabase
            .channel('pesapal_transactions_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'pesapal_transactions' },
                () => {
                    fetchTransactions();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('pesapal_transactions')
                .select('*, booking:bookings(customer_name, customer_email, customer_phone, tour_id)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch real-time transactions.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(tx =>
        tx.merchant_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.order_tracking_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.booking?.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.booking?.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'completed' || s === 'success') return <Badge className="bg-emerald-500 text-white border-0">Completed</Badge>;
        if (s === 'pending') return <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>;
        if (s === 'failed' || s === 'invalid') return <Badge variant="destructive">Failed</Badge>;
        return <Badge variant="secondary">{status}</Badge>;
    };

    if (loading && transactions.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by reference, ID or customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button
                        onClick={() => window.print()}
                        variant="outline"
                        className="rounded-xl gap-2 border-slate-200 dark:border-slate-800 hidden md:flex"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Export Report (PDF)
                    </Button>
                    <Button
                        onClick={fetchTransactions}
                        variant="outline"
                        className="rounded-xl gap-2 border-slate-200 dark:border-slate-800"
                    >
                        <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Print Only Header */}
            <div className="hidden print:block mb-8 border-b pb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter">Ryoko Tours Kenya</h1>
                        <p className="text-slate-500 text-sm">Financial Transactions Report</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Generated: {new Date().toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden rounded-2xl bg-white dark:bg-slate-900">
                <CardHeader className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-amber-500" />
                        <div>
                            <CardTitle className="text-lg">Recent Transactions</CardTitle>
                            <CardDescription>Real-time payment records from your gateway</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/30 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                                    <TableHead className="font-bold py-4">Customer</TableHead>
                                    <TableHead className="font-bold py-4">Reference / ID</TableHead>
                                    <TableHead className="font-bold py-4">Amount</TableHead>
                                    <TableHead className="font-bold py-4">Status</TableHead>
                                    <TableHead className="font-bold py-4 text-right">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.map((tx) => (
                                    <TableRow key={tx.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                        <TableCell className="py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-3 w-3 text-slate-400" />
                                                    <p className="font-bold text-slate-900 dark:text-white">{tx.booking?.customer_name || 'GUEST'}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <Mail className="h-3 w-3" />
                                                    <span>{tx.booking?.customer_email || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="space-y-1">
                                                <p className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold tracking-tight">
                                                    Ref: {tx.merchant_reference}
                                                </p>
                                                <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                                                    ID: {tx.order_tracking_id?.slice(0, 16)}...
                                                    <ExternalLink className="h-2 w-2" />
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <p className="font-bold text-slate-900 dark:text-white">
                                                {tx.currency} {tx.amount.toLocaleString()}
                                            </p>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {getStatusBadge(tx.status)}
                                        </TableCell>
                                        <TableCell className="text-right py-4">
                                            <div className="space-y-1">
                                                <p className="text-sm text-slate-900 dark:text-white">
                                                    {new Date(tx.created_at).toLocaleDateString()}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    {new Date(tx.created_at).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredTransactions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-20 text-center text-muted-foreground">
                                            No transactions found matching your search.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TransactionManagement;
