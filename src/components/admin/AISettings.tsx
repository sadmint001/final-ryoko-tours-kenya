import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Save, RotateCcw, Sparkles } from 'lucide-react';
import Loader from '@/components/ui/loader';

const DEFAULT_KNOWLEDGE = `Ryoko Tours Africa is a premier travel and safari company based in Kenya. The name "Ryoko" means "journey" in Japanese, reflecting our commitment to creating meaningful travel experiences.

Our Mission: To craft transformative travel experiences that immerse guests in Africa's soul, fostering cultural connection, growth, and adventure.
Our Vision: To position Kenya and Africa as global leaders in authentic, sustainable tourism.

Core Values:
- Passion for Africa: Showcasing the continent's incredible diversity.
- Safety First: Adhering to international safety standards.
- Sustainable Tourism: Promoting eco-tourism that uplifts communities.
- Expert Guides: Providing deep storytelling and cultural heritage.

Why Us:
1. Exceptional Service: 24/7 dedicated support before and during your trip.
2. Unforgettable Experiences: Handpicked hidden gems from the Maasai Mara to Diani.
3. Safety Always: Fully insured vehicles and certified, warm professionals.
4. Stories Worth Telling: We focus on genuine encounters and authentic moments.

Our Services:
We specialize in curated safaris, coastal escapes, cultural tours, and personalized itineraries across Kenya.

Site Structure & Pages:
- Home: Featured tours and travel stories.
- Destinations: Our full catalog of safaris and experiences.
- About Us: Detailed history and mission statement.
- Why Us: Our core pillars and competitive advantages.
- Blog: Travel tips, guides, and stories from the field.
- Contact: Support and custom itinerary requests.`;

const AISettings = () => {
    const [persona, setPersona] = useState('');
    const [instructions, setInstructions] = useState('');
    const [knowledge, setKnowledge] = useState('');
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
                .from('site_settings' as any)
                .select('*')
                .in('key', ['ai_persona', 'ai_special_instructions', 'ai_company_knowledge']);

            if (error) throw error;

            const rows = data as { key: string; value: string }[] | null;
            if (rows) {
                const personaSetting = rows.find(s => s.key === 'ai_persona');
                const instructionsSetting = rows.find(s => s.key === 'ai_special_instructions');
                const knowledgeSetting = rows.find(s => s.key === 'ai_company_knowledge');

                if (personaSetting) {
                    setPersona(personaSetting.value);
                } else {
                    setPersona("You are the Ryoko Tours Assistant, a professional and friendly customer service bot for Ryoko Tours Africa. Your goal is to help users plan their dream safari or tour in Kenya.");
                }

                if (instructionsSetting) {
                    setInstructions(instructionsSetting.value);
                } else {
                    setInstructions("Be professional, warm, and helpful. If you don't know something, ask them to leave a message and an agent will get back to them. Encourage booking if they seem interested. Keep responses concise and engaging. Leverage the Company Knowledge Base to provide specific details about our mission, vision, and site.");
                }

                if (knowledgeSetting) {
                    setKnowledge(knowledgeSetting.value);
                } else {
                    // Prepopulate with default if missing in DB
                    setKnowledge(DEFAULT_KNOWLEDGE);
                }
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed to fetch AI settings: ' + error.message,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const updates = [
                { key: 'ai_persona', value: persona },
                { key: 'ai_special_instructions', value: instructions },
                { key: 'ai_company_knowledge', value: knowledge }
            ];

            for (const update of updates) {
                const { error } = await supabase
                    .from('site_settings' as any)
                    .upsert(update as any, { onConflict: 'key' });
                if (error) throw error;
            }

            toast({
                title: 'Success',
                description: 'AI Support Bot settings updated successfully.'
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

    if (loading) return <div className="p-12 flex justify-center"><Loader label="Loading AI configuration..." /></div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Bot className="w-8 h-8 text-amber-500" />
                        AI Support Bot
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your automated safari expert.</p>
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
                <Card className="border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <CardTitle className="text-lg">AI Persona</CardTitle>
                        </div>
                        <CardDescription>Define who your AI Support Bot is and its primary goal.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="persona">Persona Background</Label>
                            <Textarea
                                id="persona"
                                placeholder="e.g. You are the Ryoko Tours Assistant..."
                                className="min-h-[150px] resize-none focus:ring-amber-500/20"
                                value={persona}
                                onChange={(e) => setPersona(e.target.value)}
                            />
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">This defines the "Identity" of the bot.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                        <div className="flex items-center gap-2">
                            <RotateCcw className="w-4 h-4 text-orange-500" />
                            <CardTitle className="text-lg">Special Instructions</CardTitle>
                        </div>
                        <CardDescription>Ground rules, tone of voice, and fallback behaviors.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="instructions">Behavioral Rules</Label>
                            <Textarea
                                id="instructions"
                                placeholder="e.g. Be professional, warm, and helpful..."
                                className="min-h-[150px] resize-none focus:ring-amber-500/20"
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                            />
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Rules the AI must follow at all times.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                    <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-blue-500" />
                        <CardTitle className="text-lg">Company Knowledge Base</CardTitle>
                    </div>
                    <CardDescription>Provide detailed information about Ryoko Tours Africa, our history, and site structure.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="knowledge">Detailed Knowledge</Label>
                        <Textarea
                            id="knowledge"
                            placeholder="Add mission, vision, services, and general company info here..."
                            className="min-h-[250px] resize-none focus:ring-amber-500/20"
                            value={knowledge}
                            onChange={(e) => setKnowledge(e.target.value)}
                        />
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">This info will be provided to the AI as "Global Context".</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-amber-500/20 bg-amber-500/5 overflow-hidden">
                <CardContent className="p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-amber-700 dark:text-amber-400 text-sm">Pro Tip: Dynamic Grounding</h4>
                        <p className="text-xs text-amber-600 dark:text-amber-500/80 leading-relaxed mt-1">
                            The AI is automatically updated with your latest destinations and tour details. You don't need to manually list them here. Focus these instructions on <strong>tone of voice</strong> and <strong>company values</strong>.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AISettings;
