import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { subscribePresence } from '@/lib/analytics';

type Stat = { label: string; value: string | number };

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [online, setOnline] = useState<number>(0);

  useEffect(() => {
    const unsub = subscribePresence(setOnline);
    return unsub;
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: totalViews } = await supabase
        .from('page_views')
        .select('id', { count: 'exact', head: true });

      const { data: today } = await supabase
        .from('page_views')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString());

      const { data: byPath } = await supabase
        .from('page_views')
        .select('path, count:path', { count: 'exact' })
        .group('path')
        .order('count', { ascending: false })
        .limit(5);

      setStats([
        { label: 'Online Now', value: online },
        { label: 'Total Views', value: (totalViews as any)?.length ?? 0 },
        { label: 'Today', value: (today as any)?.length ?? 0 },
      ]);
      // Store top paths inside state for rendering below
      setTop(byPath as any);
    };
    fetchStats();
  }, [online]);

  const [top, setTop] = useState<{ path: string; count: number }[]>([]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {top.map((row) => (
              <div key={row.path} className="flex justify-between">
                <span className="text-muted-foreground">{row.path}</span>
                <span className="font-semibold">{row.count}</span>
              </div>
            ))}
            {top.length === 0 && <div className="text-muted-foreground">No data yet</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;


