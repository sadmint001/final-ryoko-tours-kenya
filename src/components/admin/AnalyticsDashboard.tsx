import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, Users, Calendar, Mail, Eye } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    uniqueVisitors: 0,
    popularPages: [],
    totalBookings: 0,
    totalMessages: 0,
    recentBookings: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // 1. Page Views
      const { data: pageViews } = await supabase.from('page_views').select('*');

      // 2. Bookings
      const { data: bookings, count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(5);

      // 3. Messages
      const { count: messagesCount } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true });

      // Process Page Views
      const pageCounts = (pageViews || []).reduce((acc: any, view: any) => {
        const page = view.page_path || 'unknown';
        acc[page] = (acc[page] || 0) + 1;
        return acc;
      }, {});

      const popularPages = Object.entries(pageCounts)
        .map(([page, count]: any) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const uniqueVisitors = new Set((pageViews || []).map((view: any) => view.user_id || view.session_id)).size;

      setStats({
        totalViews: (pageViews || []).length,
        uniqueVisitors,
        popularPages,
        totalBookings: bookingsCount || 0,
        totalMessages: messagesCount || 0,
        recentBookings: bookings || []
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views */}
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Total Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.totalViews}</div>
              <Eye className="h-8 w-8 text-white/50" />
            </div>
          </CardContent>
        </Card>

        {/* Unique Visitors */}
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Unique Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.uniqueVisitors}</div>
              <Users className="h-8 w-8 text-white/50" />
            </div>
          </CardContent>
        </Card>

        {/* Total Bookings */}
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.totalBookings}</div>
              <Calendar className="h-8 w-8 text-white/50" />
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.totalMessages}</div>
              <Mail className="h-8 w-8 text-white/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              Popular Pages
            </CardTitle>
            <CardDescription>Most visited pages on your site</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.popularPages.length > 0 ? (
              <div className="space-y-4">
                {stats.popularPages.map(({ page, count }: any) => (
                  <div key={page} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{page}</span>
                    <span className="text-sm font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-md">{count} views</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No page view data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              Recent Bookings
            </CardTitle>
            <CardDescription>Latest booking requests</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentBookings.length > 0 ? (
              <div className="space-y-4">
                {stats.recentBookings.map((booking: any) => (
                  <div key={booking.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">{booking.guest_name || 'Guest'}</p>
                      <p className="text-xs text-slate-500">{new Date(booking.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-md">
                      {booking.status || 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No bookings yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;