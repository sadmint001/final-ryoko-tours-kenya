import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Star, Loader2, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Testimonial {
  id: number; // Changed to number to match bigint SQL
  name: string;
  content: string;
  rating: number;
  location: string;
  source: 'google' | 'tripadvisor';
  visible: boolean;
  created_at: string;
  updated_at: string;
}

const TestimonialManagement = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    content: '',
    rating: 5,
    location: '',
    source: 'google' as 'google' | 'tripadvisor',
    visible: true
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      // Don't toast error if table missing, just show empty
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const testimonialData = {
        name: formData.name.trim(),
        content: formData.content.trim(),
        rating: formData.rating,
        location: formData.location.trim(),
        source: formData.source,
        visible: formData.visible,
        updated_at: new Date().toISOString()
      };

      if (editingTestimonial) {
        const { error } = await supabase
          .from('testimonials')
          .update(testimonialData)
          .eq('id', editingTestimonial.id);

        if (error) throw error;

        toast({ title: 'Success', description: 'Testimonial updated successfully' });
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert([{
            ...testimonialData,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;

        toast({ title: 'Success', description: 'Testimonial created successfully' });
      }

      resetForm();
      setIsDialogOpen(false);
      await fetchTestimonials();
    } catch (error: any) {
      console.error('Error saving testimonial:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save testimonial',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      content: testimonial.content,
      rating: testimonial.rating,
      location: testimonial.location,
      source: testimonial.source,
      visible: testimonial.visible
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;

      toast({ title: 'Success', description: 'Testimonial deleted successfully' });
      await fetchTestimonials();
    } catch (error: any) {
      console.error('Error deleting testimonial:', error);
      toast({ title: 'Error', variant: 'destructive', description: error.message });
    }
  };

  const toggleVisibility = async (testimonial: Testimonial) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ visible: !testimonial.visible })
        .eq('id', testimonial.id);

      if (error) throw error;

      toast({ title: 'Success', description: `Testimonial ${!testimonial.visible ? 'shown' : 'hidden'} successfully` });
      await fetchTestimonials();
    } catch (error: any) {
      toast({ title: 'Error', variant: 'destructive', description: error.message });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      content: '',
      rating: 5,
      location: '',
      source: 'google',
      visible: true
    });
    setEditingTestimonial(null);
  };

  const renderStars = (rating: number) => (
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
    ))
  );

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-serif text-slate-800 dark:text-white">Testimonials</h2>
          <p className="text-slate-500">Manage customer reviews</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTestimonial ? 'Edit Testimonial' : 'New Testimonial'}</DialogTitle>
              <DialogDescription>Add a customer review from Google or TripAdvisor.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required placeholder="USA" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rating (1-5)</Label>
                  <Input type="number" min="1" max="5" value={formData.rating} onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })} required />
                </div>
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select value={formData.source} onValueChange={(val: any) => setFormData({ ...formData, source: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google Reviews</SelectItem>
                      <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} required rows={4} placeholder="Review text..." />
              </div>

              <div className="flex items-center space-x-2">
                <Switch checked={formData.visible} onCheckedChange={c => setFormData({ ...formData, visible: c })} />
                <Label>Visible on website</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {testimonials.map((t) => (
          <Card key={t.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between p-4 pb-2 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${t.source === 'google' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {t.name}
                    {t.source === 'google' ?
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">Google</span> :
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">TripAdvisor</span>
                    }
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {renderStars(t.rating)}
                    <span className="text-xs">{t.location}</span>
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-amber-500" onClick={() => handleEdit(t)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => handleDelete(t.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{t.content}"</p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Switch checked={t.visible} onCheckedChange={() => toggleVisibility(t)} className="scale-75" />
                  <span>{t.visible ? 'Visible' : 'Hidden'}</span>
                </div>
                {new Date(t.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
        {testimonials.length === 0 && (
          <div className="text-center py-12 text-slate-500">No testimonials found. Add one to get started!</div>
        )}
      </div>
    </div>
  );
};

export default TestimonialManagement;