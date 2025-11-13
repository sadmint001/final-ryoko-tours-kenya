import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, FileText, MessageSquare, Settings, Mail, MapPin, Image, DollarSign } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Loader from '@/components/ui/loader';
import Footer from '@/components/Footer';
import BlogManagement from '@/components/admin/BlogManagement';
import TestimonialManagement from '@/components/admin/TestimonialManagement';
import NewsletterManagement from '@/components/admin/NewsletterManagement';
import SiteSettingsManagement from '@/components/admin/SiteSettingsManagement';
import DestinationManagement from '@/components/admin/DestinationManagement';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import UsersDashboard from '@/components/admin/UsersDashboard';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader label="Checking admin access..." />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have admin privileges to access this page.</p>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 md:px-8">
      <header className="mb-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm sm:text-base text-slate-300 max-w-xl">Manage your website content and settings</p>
      </header>

      {/* Tabs: horizontal scroll on small screens */}
      <nav className="mt-4 mb-6">
        <div className="overflow-x-auto pb-2 -mx-4 sm:mx-0">
          <div className="inline-flex gap-2 px-4 sm:px-0">
            {['Overview','Destinations','Blogs','Testimonials','Settings','Analytics','Users'].map((t) => (
              <button
                key={t}
                className="whitespace-nowrap text-sm sm:text-base px-3 py-2 rounded-md bg-white/5 hover:bg-white/8 transition-colors"
                aria-label={t}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Stats grid: responsive columns */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Example stat card - duplicate / map over your data */}
        <div className="rounded-2xl p-4 sm:p-6 border border-white/6 bg-gradient-to-b from-white/3 to-white/2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm text-slate-300">Total Destinations</h3>
              <div className="mt-2 text-2xl sm:text-3xl font-bold text-white">12</div>
              <p className="mt-1 text-xs text-slate-400">Active destinations</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-4 sm:p-6 border border-white/6 bg-gradient-to-b from-white/3 to-white/2">
          <div>
            <h3 className="text-xs sm:text-sm text-slate-300">Total Blogs</h3>
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-white">8</div>
            <p className="mt-1 text-xs text-slate-400">Published articles</p>
          </div>
        </div>

        <div className="rounded-2xl p-4 sm:p-6 border border-white/6 bg-gradient-to-b from-white/3 to-white/2">
          <div>
            <h3 className="text-xs sm:text-sm text-slate-300">Total Users</h3>
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-white">234</div>
            <p className="mt-1 text-xs text-slate-400">Active accounts</p>
          </div>
        </div>

        {/* Add additional cards as needed - they will wrap responsively */}
      </section>

      {/* Lower content area: stack on mobile, grid on larger screens */}
      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-4 sm:p-6 border border-white/6 bg-background/60">
          {/* Recent activity / quick actions */}
        </div>
        <div className="rounded-2xl p-4 sm:p-6 border border-white/6 bg-background/60">
          {/* Settings / shortcuts */}
        </div>
      </section>
    </div>
  );
};

export default Admin;