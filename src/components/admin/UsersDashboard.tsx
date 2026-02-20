import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Loader2,
  User,
  Mail,
  Calendar,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  MoreHorizontal,
  ArrowUpDown
} from 'lucide-react';
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
      const { data, error } = await supabase.rpc('get_managed_users');
      if (error) {
        console.error('Error fetching managed users:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch user list.',
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
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
        <p className="text-muted-foreground animate-pulse font-bold uppercase tracking-widest text-[10px]">Loading Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight uppercase">Registry Management</h2>
          <p className="text-sm text-slate-500">Manage mission personnel and access clearance levels.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900">
        <CardHeader className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Shield className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Personnel List</CardTitle>
                <CardDescription>
                  {filteredUsers.length} verified explorers in the database
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/30 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-4 pl-6">Explorer</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-4">Security Clearance</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-4">Joined Date</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-4 text-right pr-6">Admin Access</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow
                    key={u.id}
                    className={`border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors ${u.id === currentUser?.id ? 'bg-amber-500/[0.02]' : ''}`}
                  >
                    <TableCell className="py-5 pl-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'}`}>
                          {u.role === 'admin' ? <ShieldCheck className="h-5 w-5" /> : <User className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            {u.full_name || 'Anonymous Explorer'}
                            {u.id === currentUser?.id && (
                              <Badge className="bg-amber-500 text-[8px] font-black uppercase h-4 px-1 leading-none border-0">Me</Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" />
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      {u.role === 'admin' ? (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] uppercase tracking-widest font-black py-0.5">
                          Tier 1 Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] uppercase tracking-widest font-black py-0.5">
                          Standard User
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold">
                          {new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-right pr-6">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-3">
                          {updatingId === u.id && (
                            <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
                          )}
                          <Switch
                            id={`admin-toggle-${u.id}`}
                            checked={u.role === 'admin'}
                            onCheckedChange={() => toggleAdminStatus(u.id, u.role === 'admin')}
                            disabled={updatingId === u.id || u.id === currentUser?.id}
                            className="data-[state=checked]:bg-amber-500"
                          />
                        </div>
                        {u.id === currentUser?.id && (
                          <span className="text-[9px] text-amber-600 font-bold uppercase tracking-tighter italic mr-1">Protected</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <ShieldAlert className="h-12 w-12 text-slate-200 mb-4" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No personnel matched your filter</p>
              <Button variant="link" onClick={() => setSearchQuery('')} className="mt-2 text-amber-500">Reset Search</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <p className="text-[11px] text-amber-700/80 leading-relaxed font-bold uppercase tracking-tight">
            Security Protocol Warning:
          </p>
          <p className="text-[11px] text-amber-700/60 leading-relaxed mt-0.5">
            Elevation of user privileges grants global access to bookings, transactions, and analytics. Tier 1 Admin status should be reserved for verified operational personnel only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsersDashboard;