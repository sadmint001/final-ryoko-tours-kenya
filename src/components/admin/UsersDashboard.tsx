import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UserRow {
  id: string;
  email: string;
  role: string;
}

const UsersDashboard = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('users').select('id, email, raw_user_meta_data');
    if (!error && data) {
      setUsers(data.map((u: any) => ({
        id: u.id,
        email: u.email,
        role: u.raw_user_meta_data?.role || 'user',
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (id: string, newRole: string) => {
    setLoading(true);
    await supabase.rpc('set_user_role', { user_id: id, role: newRole });
    await fetchUsers();
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <div>Loading...</div>}
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="flex justify-between items-center">
              <span>{user.email}</span>
              <span className="text-muted-foreground">{user.role || 'user'}</span>
              <div className="space-x-2">
                <Button size="sm" variant="outline" disabled={user.role === 'admin'} onClick={() => updateRole(user.id, 'admin')}>Promote to Admin</Button>
                <Button size="sm" variant="outline" disabled={user.role === 'user' || !user.role} onClick={() => updateRole(user.id, 'user')}>Demote to User</Button>
              </div>
            </div>
          ))}
          {users.length === 0 && !loading && <div>No users found.</div>}
        </div>
      </CardContent>
    </Card>
  );
};

export default UsersDashboard;
