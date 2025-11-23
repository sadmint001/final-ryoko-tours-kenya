import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Star, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Testimonial {
  id: string;
  name: string;
  content: string;
  rating: number;
  location: string;
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
        console.error('Error fetching testimonials:', error);
        throw error;
      }
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch testimonials',
        variant: 'destructive'
      });
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
        visible: formData.visible,
        updated_at: new Date().toISOString()
      };

      if (editingTestimonial) {
        const { error } = await supabase
          .from('testimonials')
          .update(testimonialData)
          .eq('id', editingTestimonial.id);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Testimonial updated successfully'
        });
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert([{
            ...testimonialData,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Testimonial created successfully'
        });
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
      visible: testimonial.visible
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Testimonial deleted successfully'
      });
      
      await fetchTestimonials();
    } catch (error: any) {
      console.error('Error deleting testimonial:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete testimonial',
        variant: 'destructive'
      });
    }
  };

  const toggleVisibility = async (testimonial: Testimonial) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ 
          visible: !testimonial.visible,
          updated_at: new Date().toISOString()
        })
        .eq('id', testimonial.id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `Testimonial ${!testimonial.visible ? 'shown' : 'hidden'} successfully`
      });
      
      await fetchTestimonials();
    } catch (error: any) {
      console.error('Error updating testimonial:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update testimonial',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      content: '',
      rating: 5,
      location: '',
      visible: true
    });
    setEditingTestimonial(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Testimonial Management</h2>
          <p className="text-muted-foreground">Manage customer testimonials and reviews</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)} className="sm:w-auto w-full">
              <Plus className="mr-2 h-4 w-4" />
              New Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTestimonial ? 'Edit Testimonial' : 'Create New Testimonial'}</DialogTitle>
              <DialogDescription>
                {editingTestimonial ? 'Update the testimonial details' : 'Add a new customer testimonial to your website'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter customer name"
                  required
                  maxLength={100}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter customer location"
                  required
                  maxLength={100}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rating">Rating *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 1 })}
                    required
                    className="w-20"
                  />
                  <div className="flex">
                    {renderStars(formData.rating)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Testimonial Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  className="min-h-[120px] resize-vertical"
                  placeholder="Share the customer's experience and feedback..."
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.content.length}/1000 characters
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="visible"
                  checked={formData.visible}
                  onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })}
                />
                <Label htmlFor="visible" className="cursor-pointer">
                  Visible on website
                </Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleDialogClose}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingTestimonial ? 'Update' : 'Create'} Testimonial
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {testimonials.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-32 text-center">
              <p className="text-muted-foreground mb-2">No testimonials found</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Testimonial
              </Button>
            </CardContent>
          </Card>
        ) : (
          testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <Badge variant={testimonial.visible ? "default" : "secondary"}>
                        {testimonial.visible ? 'Visible' : 'Hidden'}
                      </Badge>
                    </div>
                    <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <span className="font-medium text-foreground/80">{testimonial.location}</span>
                      <div className="flex items-center gap-1">
                        {renderStars(testimonial.rating)}
                        <span className="text-sm text-muted-foreground ml-1">
                          ({testimonial.rating}/5)
                        </span>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex space-x-1 sm:space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleVisibility(testimonial)}
                      className="h-9 px-2 sm:px-3"
                    >
                      {testimonial.visible ? 'Hide' : 'Show'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(testimonial)}
                      className="h-9 px-2 sm:px-3"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(testimonial.id)}
                      className="h-9 px-2 sm:px-3 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-3 pt-3 border-t text-xs text-muted-foreground">
                  <span>
                    Created: {new Date(testimonial.created_at).toLocaleDateString()}
                  </span>
                  {testimonial.updated_at !== testimonial.created_at && (
                    <span>
                      Updated: {new Date(testimonial.updated_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TestimonialManagement;