import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, FileText, MessageSquare, Settings, Mail, MapPin, Image, DollarSign, Menu, X } from 'lucide-react';
import Loader from '@/components/ui/loader';
import BlogManagement from '@/components/admin/BlogManagement';
import TestimonialManagement from '@/components/admin/TestimonialManagement';
import NewsletterManagement from '@/components/admin/NewsletterManagement';
import SiteSettingsManagement from '@/components/admin/SiteSettingsManagement';
import DestinationManagement from '@/components/admin/DestinationManagement';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import UsersDashboard from '@/components/admin/UsersDashboard';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    destinations: 0,
    blogs: 0,
    users: 0
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
        
        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data);
          if (data) {
            await fetchStats();
          }
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const { count: destinationsCount } = await supabase
          .from('destinations')
          .select('*', { count: 'exact', head: true });

        const { count: blogsCount } = await supabase
          .from('blogs')
          .select('*', { count: 'exact', head: true });

        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        setStats({
          destinations: destinationsCount || 0,
          blogs: blogsCount || 0,
          users: usersCount || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    checkAdminStatus();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader label="Checking admin access..." />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm w-full">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don't have admin privileges to access this page.</p>
          <Button onClick={() => navigate('/')} className="w-full sm:w-auto">Go to Home</Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { value: 'overview', label: 'Overview', icon: DollarSign },
    { value: 'destinations', label: 'Destinations', icon: MapPin },
    { value: 'blogs', label: 'Blogs', icon: FileText },
    { value: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { value: 'newsletter', label: 'Newsletter', icon: Mail },
    { value: 'analytics', label: 'Analytics', icon: Image },
    { value: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex">
        {/* Mobile Sidebar */}
        <div className={`
          fixed top-0 left-0 h-full w-64 bg-background border-r z-50 transform transition-transform duration-200 ease-in-out lg:hidden
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Admin Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-2">
            {tabs.map((tab) => (
              <Button
                key={tab.value}
                variant={activeTab === tab.value ? "secondary" : "ghost"}
                className="w-full justify-start mb-1"
                onClick={() => {
                  setActiveTab(tab.value);
                  setMobileMenuOpen(false);
                }}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="container mx-auto p-3 sm:p-4 md:p-6">
            {/* Header with Mobile Menu Button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
                  <p className="text-muted-foreground text-sm sm:text-base mt-1">
                    Manage your website content and settings
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Tabs - Hidden on mobile */}
            <div className="hidden lg:block mb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 xl:grid-cols-7 gap-2">
                  {tabs.map((tab) => (
                    <TabsTrigger 
                      key={tab.value} 
                      value={tab.value}
                      className="flex items-center gap-2 text-xs xl:text-sm"
                    >
                      <tab.icon className="h-3 w-3 xl:h-4 xl:w-4" />
                      <span className="hidden xl:inline">{tab.label}</span>
                      <span className="xl:hidden">{tab.label.slice(0, 3)}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Mobile Tab Indicator */}
            <div className="lg:hidden mb-6">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {tabs.find(tab => tab.value === activeTab)?.label}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileMenuOpen(true)}
                  >
                    <Menu className="h-4 w-4 mr-1" />
                    Change
                  </Button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="space-y-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats Grid - Improved mobile layout */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <Card className="relative overflow-hidden">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Destinations</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.destinations}</div>
                        <p className="text-xs text-muted-foreground">Active destinations</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.blogs}</div>
                        <p className="text-xs text-muted-foreground">Published articles</p>
                      </CardContent>
                    </Card>

                    <Card className="xs:col-span-2 lg:col-span-1">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.users}</div>
                        <p className="text-xs text-muted-foreground">Registered users</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions - Stack on mobile */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                        <CardDescription>Common admin tasks</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {tabs.slice(1).map((tab) => (
                          <Button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            variant="outline"
                            className="w-full justify-start h-11"
                          >
                            <tab.icon className="h-4 w-4 mr-3" />
                            {tab.label}
                          </Button>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                        <CardDescription>Latest system events</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">System updated</p>
                              <p className="text-xs text-muted-foreground">Just now</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">New user registered</p>
                              <p className="text-xs text-muted-foreground">5 minutes ago</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Other Tabs */}
              {activeTab === 'destinations' && (
                <div className="bg-card rounded-lg border">
                  <DestinationManagement />
                </div>
              )}

              {activeTab === 'blogs' && (
                <div className="bg-card rounded-lg border">
                  <BlogManagement />
                </div>
              )}

              {activeTab === 'testimonials' && (
                <div className="bg-card rounded-lg border">
                  <TestimonialManagement />
                </div>
              )}

              {activeTab === 'newsletter' && (
                <div className="bg-card rounded-lg border">
                  <NewsletterManagement />
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="bg-card rounded-lg border">
                  <AnalyticsDashboard />
                </div>
              )}

              {activeTab === 'users' && (
                <div className="bg-card rounded-lg border">
                  <UsersDashboard />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;