import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, Users, Calendar, Mail, Eye, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import PerformanceCard from './analytics/PerformanceCard';
import VisitorAnalyticsByRegion from './analytics/VisitorAnalyticsByRegion';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    totalViews: 0,
    uniqueVisitors: 0,
    popularPages: [],
    totalBookings: 0,
    totalMessages: 0,
    totalRevenue: 0,
    revenueChange: '0',
    revenueChangeType: 'neutral' as 'positive' | 'negative' | 'neutral',
    revenueHistory: [] as { val: number }[],
    recentBookings: [],
    allViews: [],
    continentStats: [],
    countryStats: [],
    regionCounts: {} as Record<string, number>
  });

  // Mock historical data for sparklines
  const mockHistory = [
    { val: 400 }, { val: 600 }, { val: 500 }, { val: 800 },
    { val: 700 }, { val: 1100 }, { val: 900 }, { val: 1200 }
  ];

  useEffect(() => {
    fetchAnalytics();

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
      // Fetch robust aggregated stats
      const { data: globalStats, error: statsError } = await (supabase.rpc as any)('get_global_analytics');
      if (statsError) throw statsError;

      const report = globalStats && globalStats[0] ? globalStats[0] : {
        total_impressions: 0,
        unique_visitors: 0,
        region_counts: {}
      };

      const { data: pageViewsData } = await supabase.from('page_views').select('*');
      const pageViews = pageViewsData || [];

      const { data: bookingsData, count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      const recentBookings = (bookingsData || []).slice(0, 5);

      const { count: messagesCount } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true });

      // Source 1: PesaPal transactions (case-insensitive status check)
      const { data: transactionsData } = await supabase
        .from('pesapal_transactions')
        .select('amount, status, created_at');

      const completedTx = (transactionsData || []).filter(tx =>
        ['completed', 'success'].includes((tx.status || '').toLowerCase())
      );
      const pesapalRevenue = completedTx.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

      // Source 2: Bookings with paid status
      const { data: paidBookings } = await supabase
        .from('bookings')
        .select('total_amount, payment_status, created_at')
        .eq('payment_status', 'paid');

      const bookingsRevenue = (paidBookings || []).reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);

      // Use the higher value to avoid under-reporting
      const totalRevenue = Math.max(pesapalRevenue, bookingsRevenue);

      // Calculate period-over-period change (last 30 days vs previous 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Combine both sources for period calculations
      const allRevenueItems = [
        ...completedTx.map(tx => ({ amount: Number(tx.amount) || 0, date: new Date(tx.created_at) })),
        ...(pesapalRevenue >= bookingsRevenue ? [] :
          (paidBookings || []).map(b => ({ amount: Number(b.total_amount) || 0, date: new Date(b.created_at) }))
        )
      ];

      const recentRevenue = allRevenueItems
        .filter(item => item.date >= thirtyDaysAgo)
        .reduce((sum, item) => sum + item.amount, 0);
      const previousRevenue = allRevenueItems
        .filter(item => item.date >= sixtyDaysAgo && item.date < thirtyDaysAgo)
        .reduce((sum, item) => sum + item.amount, 0);

      const revenueChangePct = previousRevenue > 0
        ? ((recentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
        : recentRevenue > 0 ? '100.0' : '0.0';
      const revenueChangeType: 'positive' | 'negative' | 'neutral' =
        Number(revenueChangePct) > 0 ? 'positive' : Number(revenueChangePct) < 0 ? 'negative' : 'neutral';

      // Build real daily revenue sparkline (last 8 days)
      const revenueHistory: { val: number }[] = [];
      for (let i = 7; i >= 0; i--) {
        const dayStart = new Date(now);
        dayStart.setHours(0, 0, 0, 0);
        dayStart.setDate(dayStart.getDate() - i);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        const dayTotal = allRevenueItems
          .filter(item => item.date >= dayStart && item.date < dayEnd)
          .reduce((sum, item) => sum + item.amount, 0);
        revenueHistory.push({ val: dayTotal });
      }

      const pageCounts = pageViews.reduce((acc: any, view: any) => {
        const page = view.page_path || 'unknown';
        acc[page] = (acc[page] || 0) + 1;
        return acc;
      }, {});

      const popularPages = Object.entries(pageCounts)
        .map(([page, count]: any) => ({ page, count }))
        .sort((a, b) => (b as any).count - (a as any).count)
        .slice(0, 5);

      setStats({
        totalViews: Number(report.total_impressions) || pageViews.length,
        uniqueVisitors: Number(report.unique_visitors) || 0,
        popularPages: popularPages as any,
        totalBookings: bookingsCount || 0,
        totalMessages: messagesCount || 0,
        totalRevenue: totalRevenue,
        revenueChange: revenueChangePct,
        revenueChangeType: revenueChangeType,
        revenueHistory: revenueHistory,
        recentBookings: recentBookings,
        allViews: pageViews,
        continentStats: Object.entries(report.region_counts || {}).map(([name, count]) => ({ name, count: Number(count) })),
        countryStats: [],
        regionCounts: report.region_counts || {}
      } as any);

    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleResetAnalytics = async () => {
    if (!confirm('Are you sure you want to reset all analytics counters? This will NOT delete visitor cookies.')) return;

    try {
      const { error } = await (supabase.rpc as any)('reset_global_counters');
      if (error) throw error;
      fetchAnalytics();
    } catch (error) {
      console.error('Reset error:', error);
      alert('Failed to reset analytics');
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 min-h-screen bg-[#050505] text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            Analytics <span className="text-amber-500">Insights</span>
          </h2>
          <p className="text-slate-400 font-bold mt-1 tracking-widest uppercase text-xs">
            Enterprise Traffic Monitoring & Performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetAnalytics}
            className="bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold uppercase text-[10px] tracking-widest"
          >
            Reset All Counters
          </Button>
          <Button className="bg-amber-500 hover:bg-amber-600 text-black font-black rounded-xl px-6 py-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] uppercase tracking-tighter italic">
            Export Report
          </Button>
        </div>
      </div>

      {/* AdSense Style Performance Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PerformanceCard
          title="Total Revenue"
          value={`KSh ${stats.totalRevenue.toLocaleString()}`}
          change={`${Number(stats.revenueChange) >= 0 ? '+' : ''}${stats.revenueChange}%`}
          changeType={stats.revenueChangeType}
          data={stats.revenueHistory.length > 0 ? stats.revenueHistory : mockHistory}
          color="#10b981"
        />
        <PerformanceCard
          title="Unique Visitors"
          value={stats.uniqueVisitors.toLocaleString()}
          change="+8.2%"
          changeType="positive"
          data={mockHistory.map(d => ({ val: d.val * 0.8 }))}
          color="#3b82f6"
        />
        <PerformanceCard
          title="Conversions"
          value={`${stats.uniqueVisitors > 0 ? ((stats.totalBookings / stats.uniqueVisitors) * 100).toFixed(1) : 0}%`}
          change="-2.1%"
          changeType="negative"
          data={mockHistory.map(d => ({ val: d.val * 0.5 }))}
          color="#8b5cf6"
        />
        <PerformanceCard
          title="Support Tickets"
          value={stats.totalMessages}
          change="+5"
          changeType="neutral"
          data={mockHistory.map(d => ({ val: d.val * 0.2 }))}
          color="#f43f5e"
        />
      </div>

      {/* Advanced Regional Analytics */}
      <VisitorAnalyticsByRegion data={stats.regionCounts} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white dark:bg-[#0a0a0a] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
            <CardTitle className="flex items-center gap-3 text-2xl font-black tracking-tighter uppercase">
              <TrendingUp className="w-6 h-6 text-amber-500" />
              Viral Content
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">Your most engaged pages across the platform</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {stats.popularPages.length > 0 ? (
              <div className="space-y-4">
                {stats.popularPages.map(({ page, count }: any) => (
                  <div key={page} className="flex justify-between items-center p-5 rounded-[1.5rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 hover:border-amber-500/20 transition-all group">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[240px] text-sm group-hover:text-amber-600 transition-colors">{page}</span>
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Live Endpoint</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-black text-slate-900 dark:text-white tracking-tighter">{count.toLocaleString()}</span>
                      <span className="text-[9px] font-black uppercase text-amber-500/50">Hits</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Waiting for traffic data...</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#0a0a0a] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
            <CardTitle className="flex items-center gap-3 text-2xl font-black tracking-tighter uppercase">
              <Calendar className="w-6 h-6 text-emerald-500" />
              Recent Missions
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">Latest explorer deployment status</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {stats.recentBookings.length > 0 ? (
              <div className="space-y-4">
                {stats.recentBookings.map((booking: any) => (
                  <div key={booking.id} className="flex justify-between items-center p-5 rounded-[1.5rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 hover:border-emerald-500/20 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                        <Users className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-sm tracking-tight group-hover:text-emerald-600 transition-colors">
                          {booking.customer_name || 'Anonymous Explorer'}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={`text-[10px] font-black px-4 py-1.5 rounded-full border uppercase tracking-widest ${booking.payment_status === 'paid'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}>
                      {booking.payment_status || 'Pending'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No explorer data found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;