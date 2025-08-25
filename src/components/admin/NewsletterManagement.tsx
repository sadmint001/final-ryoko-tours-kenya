import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Mail, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed: boolean;
  created_at: string;
}

const NewsletterManagement = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    unsubscribed: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const subscriberData = data || [];
      setSubscribers(subscriberData);
      
      // Calculate stats
      const total = subscriberData.length;
      const active = subscriberData.filter(sub => sub.subscribed).length;
      const unsubscribed = total - active;
      
      setStats({ total, active, unsubscribed });
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch newsletter subscribers',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Subscriber deleted successfully'
      });
      
      fetchSubscribers();
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete subscriber',
        variant: 'destructive'
      });
    }
  };

  const toggleSubscription = async (subscriber: NewsletterSubscriber) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ subscribed: !subscriber.subscribed })
        .eq('id', subscriber.id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `Subscriber ${!subscriber.subscribed ? 'resubscribed' : 'unsubscribed'} successfully`
      });
      
      fetchSubscribers();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to update subscription',
        variant: 'destructive'
      });
    }
  };

  const exportSubscribers = () => {
    const activeSubscribers = subscribers.filter(sub => sub.subscribed);
    const emails = activeSubscribers.map(sub => sub.email).join('\n');
    
    const blob = new Blob([emails], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Success',
      description: 'Subscriber list exported successfully'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Newsletter Management</h2>
          <p className="text-muted-foreground">Manage your newsletter subscribers</p>
        </div>
        
        {stats.active > 0 && (
          <Button onClick={exportSubscribers}>
            <Download className="mr-2 h-4 w-4" />
            Export Subscribers
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
            <Mail className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.unsubscribed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Subscribers List */}
      <div className="space-y-4">
        {subscribers.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No newsletter subscribers found.</p>
            </CardContent>
          </Card>
        ) : (
          subscribers.map((subscriber) => (
            <Card key={subscriber.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div>
                      <CardTitle className="text-base">{subscriber.email}</CardTitle>
                      <CardDescription>
                        Subscribed: {new Date(subscriber.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={subscriber.subscribed ? "default" : "secondary"}
                      className={subscriber.subscribed ? "bg-green-100 text-green-800" : ""}
                    >
                      {subscriber.subscribed ? 'Active' : 'Unsubscribed'}
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleSubscription(subscriber)}
                    >
                      {subscriber.subscribed ? 'Unsubscribe' : 'Resubscribe'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(subscriber.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsletterManagement;