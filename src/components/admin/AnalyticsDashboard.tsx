import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, Users, Calendar, Mail, Eye, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    uniqueVisitors: 0,
    popularPages: [],
    totalBookings: 0,
    totalMessages: 0,
    totalRevenue: 0,
    recentBookings: [],
    allViews: []
  });

  useEffect(() => {
    fetchAnalytics();

    // Set up Real-time listeners
    const bookingsChannel = supabase
      .channel('admin_analytics_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchAnalytics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pesapal_transactions' }, () => fetchAnalytics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => fetchAnalytics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'page_views' }, () => fetchAnalytics())
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
    };
  }, []);

  const fetchAnalytics = async () => {
    try {
      // 1. Fetch Page Views
      const { data: pageViewsData } = await supabase.from('page_views').select('*');
      const pageViews = pageViewsData || [];

      // 2. Fetch Bookings (for count and list)
      const { data: bookingsData, count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      const recentBookings = (bookingsData || []).slice(0, 5);

      // 3. Fetch Messages
      const { count: messagesCount } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true });

      // 4. Fetch Transactions for Revenue Calculation
      const { data: transactionsData } = await supabase
        .from('pesapal_transactions')
        .select('amount, status')
        .filter('status', 'eq', 'COMPLETED');

      const totalRevenue = (transactionsData || []).reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

      // Process Popular Pages
      const pageCounts = pageViews.reduce((acc: any, view: any) => {
        const page = view.page_path || 'unknown';
        acc[page] = (acc[page] || 0) + 1;
        return acc;
      }, {});

      const popularPages = Object.entries(pageCounts)
        .map(([page, count]: any) => ({ page, count }))
        .sort((a, b) => (b as any).count - (a as any).count)
        .slice(0, 5);

      const uniqueVisitors = new Set(pageViews.map((view: any) => view.user_id || view.session_id)).size;

      setStats({
        totalViews: pageViews.length,
        uniqueVisitors,
        popularPages: popularPages as any,
        totalBookings: bookingsCount || 0,
        totalMessages: messagesCount || 0,
        totalRevenue: totalRevenue,
        recentBookings: recentBookings,
        allViews: pageViews
      });

    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get stats for various dimensions
  const getDimensionStats = (pageViews: any[], dimension: string) => {
    const counts = pageViews.reduce((acc: any, view: any) => {
      const val = view[dimension] || 'Unknown';
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([name, count]: any) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  if (loading && stats.totalViews === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="bg-[#0a0a0a] border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em]">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-black text-white tracking-tighter">
                KSh {stats.totalRevenue.toLocaleString()}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <DollarSign className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
            <p className="text-[10px] text-emerald-500/70 mt-2 font-bold uppercase tracking-widest">• Verified Revenue</p>
          </CardContent>
        </Card>

        {/* Unique Visitors */}
        <Card className="bg-[#0a0a0a] border border-white/5 shadow-2xl group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-blue-500 uppercase tracking-[0.2em]">Live Traffic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-black text-white tracking-tighter">{stats.uniqueVisitors}</div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <p className="text-[10px] text-blue-500/70 mt-2 font-bold uppercase tracking-widest">• Unique Souls</p>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="bg-[#0a0a0a] border border-white/5 shadow-2xl group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-purple-500 uppercase tracking-[0.2em]">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-black text-white tracking-tighter">
                {stats.uniqueVisitors > 0 ? ((stats.totalBookings / stats.uniqueVisitors) * 100).toFixed(1) : 0}%
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <p className="text-[10px] text-purple-500/70 mt-2 font-bold uppercase tracking-widest">• Booking Conversion</p>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="bg-[#0a0a0a] border border-white/5 shadow-2xl group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-rose-500 uppercase tracking-[0.2em]">Inbound Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-black text-white tracking-tighter">{stats.totalMessages}</div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <Mail className="h-6 w-6 text-rose-500" />
              </div>
            </div>
            <p className="text-[10px] text-rose-500/70 mt-2 font-bold uppercase tracking-widest">• Customer Support</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 shadow-xl transition-all">
          <CardHeader className="border-b border-slate-100 dark:border-white/5">
            <CardTitle className="flex items-center gap-2 text-lg font-serif">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              Viral Content
            </CardTitle>
            <CardDescription className="text-slate-500">Your most engaged pages</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {stats.popularPages.length > 0 ? (
              <div className="space-y-3">
                {stats.popularPages.map(({ page, count }: any) => (
                  <div key={page} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-amber-500/20 transition-all">
                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px] text-sm">{page}</span>
                    <span className="text-xs font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full uppercase tracking-tighter">{count} Hits</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Waiting for traffic data...</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 shadow-xl transition-all">
          <CardHeader className="border-b border-slate-100 dark:border-white/5">
            <CardTitle className="flex items-center gap-2 text-lg font-serif">
              <Calendar className="w-5 h-5 text-emerald-500" />
              Recent Missions
            </CardTitle>
            <CardDescription className="text-slate-500">Latest active booking requests</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {stats.recentBookings.length > 0 ? (
              <div className="space-y-3">
                {stats.recentBookings.map((booking: any) => (
                  <div key={booking.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:bg-emerald-500/5 transition-all">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-sm tracking-tight">{booking.customer_name || 'Anonymous'}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${booking.payment_status === 'paid'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-amber-500/10 text-amber-500'
                      }`}>
                      {booking.payment_status || 'Pending'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No active bookings found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;