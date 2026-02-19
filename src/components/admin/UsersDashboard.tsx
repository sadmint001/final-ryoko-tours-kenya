import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, User, Mail, Calendar, Shield, ShieldAlert, ShieldCheck, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

interface ManagedUser {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  created_at: string;
  last_sign_in_at: string | null;
}

const UsersDashboard = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();

    // Set up real-time listener for profile changes (roles)
    const channel = supabase
      .channel('public-profiles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      // Use the new secure RPC to get users with emails and roles
      const { data, error } = await supabase.rpc('get_managed_users');

      if (error) {
        console.error('Error fetching managed users:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch user list. Make sure you have admin privileges.',
          variant: 'destructive',
        });
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (targetId: string, currentIsAdmin: boolean) => {
    if (targetId === currentUser?.id && currentIsAdmin) {
      toast({
        title: 'Action blocked',
        description: 'You cannot remove your own admin status.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUpdatingId(targetId);
      const newStatus = !currentIsAdmin;

      const { error } = await supabase.rpc('set_user_admin_status', {
        target_user_id: targetId,
        is_admin_requested: newStatus,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `User role updated to ${newStatus ? 'Admin' : 'User'}.`,
      });

      // Refresh local state
      await fetchUsers();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Update failed',
        description: error.message || 'Could not update user role.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) =>
  (u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary/50" />
            <p className="text-muted-foreground animate-pulse">Loading mission personnel...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-tight">Personnel Management</h2>
          <p className="text-muted-foreground">Manage access levels and mission clearance for all explorers.</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9 bg-white/50 dark:bg-black/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-slate-200 dark:border-white/5 shadow-xl bg-white dark:bg-[#0a0a0a]">
        <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-serif">Registry</CardTitle>
              <CardDescription>
                Showing {filteredUsers.length} explorers in the database
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 transition-colors hover:bg-slate-50/50 dark:hover:bg-white/[0.02] ${u.id === currentUser?.id ? 'bg-primary/[0.02]' : ''}`}
                >
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <div className={`p-3 rounded-xl ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'}`}>
                      {u.role === 'admin' ? <ShieldCheck className="h-6 w-6" /> : <User className="h-6 w-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg">{u.full_name || 'Anonymous Explorer'}</p>
                        {u.role === 'admin' && (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] uppercase tracking-widest font-black">
                            Admin
                          </Badge>
                        )}
                        {u.id === currentUser?.id && (
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none text-[10px] uppercase font-black">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{u.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Joined {new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-center">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`admin-toggle-${u.id}`} className="text-xs font-black uppercase tracking-tighter text-muted-foreground">
                          Admin Access
                        </Label>
                        <Switch
                          id={`admin-toggle-${u.id}`}
                          checked={u.role === 'admin'}
                          onCheckedChange={() => toggleAdminStatus(u.id, u.role === 'admin')}
                          disabled={updatingId === u.id || u.id === currentUser?.id}
                        />
                      </div>
                      {u.id === currentUser?.id && (
                        <span className="text-[10px] text-amber-600/80 font-medium italic">Cannot modify self</span>
                      )}
                    </div>

                    {updatingId === u.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <ShieldAlert className="h-12 w-12 text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground font-medium">No explorers found matching your search.</p>
                <Button variant="link" onClick={() => setSearchQuery('')} className="mt-2">Clear search</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
        <p className="text-xs text-amber-700/80 leading-relaxed">
          <span className="font-bold">Security Note:</span> Granting Admin access allows users to manage content, bookings, and other personnel.
          Use caution when elevating privileges. All changes are logged for security auditing.
        </p>
      </div>
    </div>
  );
};

export default UsersDashboard;