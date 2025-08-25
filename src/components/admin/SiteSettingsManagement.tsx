import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface SiteSetting {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

const SiteSettingsManagement = () => {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSetting, setEditingSetting] = useState<SiteSetting | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    key: '',
    value: ''
  });

  // Common site settings that might be useful
  const commonSettings = [
    { key: 'site_title', description: 'Website title shown in browser tab' },
    { key: 'site_description', description: 'Meta description for SEO' },
    { key: 'contact_email', description: 'Primary contact email address' },
    { key: 'contact_phone', description: 'Primary contact phone number' },
    { key: 'business_address', description: 'Business physical address' },
    { key: 'social_facebook', description: 'Facebook page URL' },
    { key: 'social_instagram', description: 'Instagram profile URL' },
    { key: 'social_twitter', description: 'Twitter profile URL' },
    { key: 'google_analytics_id', description: 'Google Analytics tracking ID' },
    { key: 'emergency_contact', description: 'Emergency contact number for tours' }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('key', { ascending: true });

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch site settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSetting) {
        const { error } = await supabase
          .from('site_settings')
          .update({
            value: formData.value,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingSetting.id);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Setting updated successfully'
        });
      } else {
        // Check if key already exists
        const existingSetting = settings.find(s => s.key === formData.key);
        if (existingSetting) {
          toast({
            title: 'Error',
            description: 'A setting with this key already exists',
            variant: 'destructive'
          });
          return;
        }

        const { error } = await supabase
          .from('site_settings')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Setting created successfully'
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchSettings();
    } catch (error) {
      console.error('Error saving setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to save setting',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (setting: SiteSetting) => {
    setEditingSetting(setting);
    setFormData({
      key: setting.key,
      value: setting.value
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this setting?')) return;

    try {
      const { error } = await supabase
        .from('site_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Setting deleted successfully'
      });
      
      fetchSettings();
    } catch (error) {
      console.error('Error deleting setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete setting',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      key: '',
      value: ''
    });
    setEditingSetting(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const quickCreateSetting = (key: string) => {
    setFormData({ key, value: '' });
    setEditingSetting(null);
    setIsDialogOpen(true);
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
          <h2 className="text-2xl font-bold">Site Settings</h2>
          <p className="text-muted-foreground">Manage global website settings and configuration</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Setting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingSetting ? 'Edit Setting' : 'Create New Setting'}</DialogTitle>
              <DialogDescription>
                {editingSetting ? 'Update the setting value' : 'Add a new site setting'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="key">Setting Key</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  required
                  disabled={!!editingSetting}
                  placeholder="e.g., site_title, contact_email"
                />
              </div>
              
              <div>
                <Label htmlFor="value">Setting Value</Label>
                <Textarea
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                  placeholder="Enter the setting value..."
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {editingSetting ? 'Update' : 'Create'} Setting
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Common Settings Quick Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup</CardTitle>
          <CardDescription>
            Create common website settings with one click
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {commonSettings
              .filter(common => !settings.find(s => s.key === common.key))
              .map((common) => (
                <Button
                  key={common.key}
                  variant="outline"
                  size="sm"
                  onClick={() => quickCreateSetting(common.key)}
                  className="justify-start text-left h-auto py-2"
                >
                  <div>
                    <div className="font-medium">{common.key}</div>
                    <div className="text-xs text-muted-foreground">{common.description}</div>
                  </div>
                </Button>
              ))}
          </div>
          {commonSettings.every(common => settings.find(s => s.key === common.key)) && (
            <p className="text-sm text-muted-foreground">All common settings have been created.</p>
          )}
        </CardContent>
      </Card>

      {/* Current Settings */}
      <div className="space-y-4">
        {settings.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No site settings found. Create your first setting!</p>
            </CardContent>
          </Card>
        ) : (
          settings.map((setting) => (
            <Card key={setting.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-base font-mono">{setting.key}</CardTitle>
                    <CardDescription>
                      Last updated: {new Date(setting.updated_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(setting)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(setting.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm bg-muted p-3 rounded font-mono break-all">
                  {setting.value}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SiteSettingsManagement;