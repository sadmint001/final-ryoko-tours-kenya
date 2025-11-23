import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Mail, Calendar } from 'lucide-react';

const UsersDashboard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fix: Use the correct table name - likely 'profiles' instead of 'users'
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        // Alternative: Try auth.users if profiles doesn't work
        await fetchAuthUsers();
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthUsers = async () => {
    try {
      // Alternative method to get users through admin API
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      
      setUsers(data.users.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      })));
    } catch (error) {
      console.error('Error fetching auth users:', error);
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
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage registered users and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Joined {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {user.last_sign_in_at && (
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>
                              Last active {new Date(user.last_sign_in_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    User ID: {user.id.slice(0, 8)}...
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No users found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersDashboard;