import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Shield, Users, FileText, MessageSquare, Mail,
  MapPin, Image, LayoutDashboard, LogOut, Menu, X,
  Moon, Sun, CreditCard
} from 'lucide-react';
import Loader from '@/components/ui/loader';
import BlogManagement from '@/components/admin/BlogManagement';
import TestimonialManagement from '@/components/admin/TestimonialManagement';
import DestinationManagement from '@/components/admin/DestinationManagement';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import UsersDashboard from '@/components/admin/UsersDashboard';
import ContactMessages from '@/components/admin/ContactMessages';
import TransactionManagement from '@/components/admin/TransactionManagement';
import SupportDashboard from '@/components/admin/SupportDashboard';

const Admin = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);

  useEffect(() => {
    const fetchNewMessages = async () => {
      const { count } = await supabase
        .from('chat_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      setNewMessagesCount(count || 0);
    };
    fetchNewMessages();

    const channel = supabase
      .channel('chat-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_sessions' }, () => {
        fetchNewMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Theme Toggle State (Mock global theme state if not using a context, 
  // but assuming generic support via document class)
  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
        if (error || !data) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader label="Verifying access..." />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
        <div className="text-center max-w-sm w-full bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
          <Shield className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">Access Denied</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Admin privileges required.</p>
          <Button
            onClick={async () => {
              await signOut();
              navigate('/auth');
            }}
            className="w-full bg-slate-900 text-white rounded-xl hover:bg-slate-800"
          >
            Login
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="w-full mt-2 rounded-xl"
          >
            Back to Home
          </Button>
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Current User ID:</p>
            <code className="block bg-slate-100 dark:bg-slate-900 p-2 rounded text-xs select-all text-slate-600 dark:text-slate-300 break-all">
              {user?.id}
            </code>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { value: 'overview', label: 'Overview', icon: LayoutDashboard },
    { value: 'destinations', label: 'Destinations', icon: MapPin },
    { value: 'transactions', label: 'Transactions', icon: CreditCard },
    { value: 'bookings', label: 'Messages', icon: Mail }, // Replaced Newsletter with Messages
    { value: 'blogs', label: 'Blogs', icon: FileText },
    { value: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { value: 'support', label: 'Support', icon: MessageSquare, badge: newMessagesCount },
    { value: 'analytics', label: 'Analytics', icon: Image },
    { value: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col border-r border-slate-200 dark:border-white/5
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-6 border-b border-slate-200 dark:border-white/5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-display tracking-wide bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-200 dark:to-orange-500 bg-clip-text text-transparent">Ryoko Admin</h2>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 uppercase tracking-widest font-bold opacity-70">Management Console</p>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  setMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${activeTab === tab.value
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-900/20'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'}
                `}
              >
                <tab.icon className={`h-5 w-5 ${activeTab === tab.value ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-2 ring-white dark:ring-[#0a0a0a]">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0a0a0a]">
            <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-xs ring-4 ring-amber-500/10">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate text-slate-800 dark:text-white">{user?.email}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-widest">Administrator</p>
              </div>
            </div>
            <Button
              variant="destructive"
              className="w-full mt-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-0"
              onClick={() => {
                signOut();
                navigate('/');
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-900">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/5 shadow-sm z-10 transition-colors duration-300">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white capitalize tracking-tight font-serif">
                {tabs.find(t => t.value === activeTab)?.label}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

              {/* Overview View */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Welcome Card */}
                    <Card className="col-span-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                      <CardHeader className="relative z-10">
                        <CardTitle className="text-2xl font-serif">Welcome back, Admin</CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400">
                          Here's what's happening with your tours today.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <div className="flex flex-wrap gap-4 mt-2">
                          <Button
                            onClick={() => setActiveTab('bookings')}
                            className="bg-amber-500 hover:bg-amber-600 text-white border-0 rounded-xl"
                          >
                            Check Messages
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setActiveTab('analytics')}
                            className="bg-slate-100 dark:bg-white/10 border-slate-200 dark:border-white/20 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 rounded-xl"
                          >
                            View Analytics
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Reuse Analytics Dashboard for Overview Widgets */}
                  <AnalyticsDashboard />
                </div>
              )}

              {/* Other Tabs */}
              {activeTab === 'destinations' && (
                <div className="animate-fade-in">
                  <DestinationManagement />
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="animate-fade-in">
                  <ContactMessages />
                </div>
              )}

              {activeTab === 'blogs' && (
                <div className="animate-fade-in">
                  <BlogManagement />
                </div>
              )}

              {activeTab === 'testimonials' && (
                <div className="animate-fade-in">
                  <TestimonialManagement />
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="animate-fade-in">
                  <AnalyticsDashboard />
                </div>
              )}

              {activeTab === 'transactions' && (
                <div className="animate-fade-in">
                  <TransactionManagement />
                </div>
              )}
              {activeTab === 'users' && (
                <div className="animate-fade-in">
                  <UsersDashboard />
                </div>
              )}

              {activeTab === 'support' && (
                <div className="animate-fade-in">
                  <SupportDashboard />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Admin;