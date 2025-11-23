import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    uniqueVisitors: 0,
    popularPages: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fix: Use proper Supabase query without .group()
      const { data: pageViews, error } = await supabase
        .from('page_views')
        .select('*');

      if (error) {
        console.error('Error fetching page views:', error);
        return;
      }

      // Manual grouping in JavaScript
      const pageCounts = pageViews?.reduce((acc, view) => {
        const page = view.page_path || 'unknown';
        acc[page] = (acc[page] || 0) + 1;
        return acc;
      }, {});

      const popularPages = Object.entries(pageCounts || {})
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get unique visitors (assuming you have a user_id or session_id column)
      const uniqueVisitors = new Set(pageViews?.map(view => view.user_id || view.session_id)).size;

      setStats({
        totalViews: pageViews?.length || 0,
        uniqueVisitors,
        popularPages
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">All time views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueVisitors}</div>
            <p className="text-xs text-muted-foreground">Distinct users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.popularPages[0]?.page || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.popularPages[0]?.count || 0} views
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Popular Pages</CardTitle>
          <CardDescription>Most visited pages on your site</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.popularPages.length > 0 ? (
            <div className="space-y-2">
              {stats.popularPages.map(({ page, count }, index) => (
                <div key={page} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                  <span className="font-medium">{page}</span>
                  <span className="text-sm text-muted-foreground">{count} views</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No page view data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;