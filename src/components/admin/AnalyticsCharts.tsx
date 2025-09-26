import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DailyView {
  date: string;
  count: number;
}

const AnalyticsCharts = () => {
  const [data, setData] = useState<DailyView[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // You may need to adjust this query based on your Supabase SQL
      const { data, error } = await supabase.rpc('daily_page_views');
      if (!error && data) setData(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Page Views</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <div>Loading...</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Date</th>
                <th className="text-left">Views</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
              {data.length === 0 && !loading && <tr><td colSpan={2}>No data</td></tr>}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsCharts;
