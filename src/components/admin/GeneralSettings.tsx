import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Save, Mail, Phone, MapPin, Instagram, Facebook, Globe } from 'lucide-react';
import Loader from '@/components/ui/loader';

const GeneralSettings = () => {
    const [settings, setSettings] = useState({
        contact_email: '',
        contact_phone: '',
        contact_whatsapp: '',
        contact_address: '',
        social_instagram: '',
        social_facebook: '',
        footer_description: '',
        form_submit_email: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .in('key', Object.keys(settings));

            if (error) throw error;

            if (data) {
                const newSettings = { ...settings };
                data.forEach(s => {
                    if (s.key in newSettings) {
                        (newSettings as any)[s.key] = s.value;
                    }
                });
                setSettings(newSettings);
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed to fetch settings: ' + error.message,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const updates = Object.entries(settings).map(([key, value]) => ({
                key,
                value
            }));

            for (const update of updates) {
                const { error } = await supabase
                    .from('site_settings')
                    .upsert(update, { onConflict: 'key' });
                if (error) throw error;
            }

            toast({
                title: 'Success',
                description: 'Site settings updated successfully.'
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed to save settings: ' + error.message,
                variant: 'destructive'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (key: keyof typeof settings, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    if (loading) return <div className="p-12 flex justify-center"><Loader label="Loading configuration..." /></div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Settings className="w-8 h-8 text-amber-500" />
                        Site Settings
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage contact info and global content.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 transition-all shadow-lg shadow-amber-500/20"
                >
                    {saving ? <Loader className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Settings
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Information */}
                <Card className="border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-amber-500" />
                            <CardTitle className="text-lg">Contact Information</CardTitle>
                        </div>
                        <CardDescription>Primary contact details for the website.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="contact_email">Public Email</Label>
                            <Input
                                id="contact_email"
                                type="email"
                                value={settings.contact_email}
                                onChange={(e) => handleChange('contact_email', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact_phone">Phone Number</Label>
                            <Input
                                id="contact_phone"
                                value={settings.contact_phone}
                                onChange={(e) => handleChange('contact_phone', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact_whatsapp">WhatsApp Number (e.g., 2547...)</Label>
                            <Input
                                id="contact_whatsapp"
                                value={settings.contact_whatsapp}
                                onChange={(e) => handleChange('contact_whatsapp', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact_address">Physical Address</Label>
                            <Input
                                id="contact_address"
                                value={settings.contact_address}
                                onChange={(e) => handleChange('contact_address', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Social Media */}
                <Card className="border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-orange-500" />
                            <CardTitle className="text-lg">Social Media</CardTitle>
                        </div>
                        <CardDescription>Links to your social profiles.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="social_instagram">Instagram URL</Label>
                            <Input
                                id="social_instagram"
                                value={settings.social_instagram}
                                onChange={(e) => handleChange('social_instagram', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="social_facebook">Facebook URL</Label>
                            <Input
                                id="social_facebook"
                                value={settings.social_facebook}
                                onChange={(e) => handleChange('social_facebook', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Content */}
                <Card className="border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 overflow-hidden lg:col-span-2">
                    <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-500" />
                            <CardTitle className="text-lg">Global Content & Forms</CardTitle>
                        </div>
                        <CardDescription>Brand messaging and form configurations.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="footer_description">Footer Brand Description</Label>
                            <Textarea
                                id="footer_description"
                                className="min-h-[100px] resize-none"
                                value={settings.footer_description}
                                onChange={(e) => handleChange('footer_description', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="form_submit_email">FormSubmit Receipt Email</Label>
                            <Input
                                id="form_submit_email"
                                type="email"
                                value={settings.form_submit_email}
                                onChange={(e) => handleChange('form_submit_email', e.target.value)}
                            />
                            <p className="text-xs text-slate-500">The email where Contact Us form submissions will be sent.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default GeneralSettings;
