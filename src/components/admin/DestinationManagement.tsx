import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { MapPin, Plus, Edit, Trash2, Image as ImageIcon, DollarSign, Clock, Users, Star, Copy, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { logAdminAction } from '@/services/activityLog';
import { supabase } from '@/integrations/supabase/client';
import Loader from '@/components/ui/loader';
import ImageUpload from './ImageUpload';
import MultiImageUpload, { GalleryItem } from './MultiImageUpload';

// Local untyped alias to access tables not present in generated Database types
// This avoids TS overload errors for custom tables like 'destinations' and 'destination_media'
const sb: any = supabase;

interface Destination {
  id: number;
  name: string;
  description: string;
  highlights: string[];
  image: string;
  pricing: {
    citizenPrice: number;
    residentPrice: number;
    nonResidentPrice: number;
  };
  category: string;
  duration?: number;
  maxParticipants?: number;
  difficulty?: string;
  rating?: number;
  location?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  featuredOrder?: number;
}

const DestinationManagement = () => {
  const { user } = useAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDestinations, setSelectedDestinations] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const { toast } = useToast();

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  // Persist image immediately when changed during edit mode
  const handlePrimaryImageChange = async (url: string) => {
    // Always update the form state so new entries also get the image
    setFormData(prev => ({ ...prev, image: url }));
    if (editingDestination?.id) {
      try {
        const { error } = await sb
          .from('destinations')
          .update({ image: url })
          .eq('id', editingDestination.id);
        if (error) throw error;
        toast({ title: 'Image saved', description: 'Primary image updated successfully.' });
        // Refresh list so updated_at and preview reflect instantly
        fetchDestinations();
      } catch (e) {
        console.error('Auto-save image failed:', e);
        toast({ title: 'Error', description: 'Failed to save image. Please try again.', variant: 'destructive' });
      }
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    highlights: [''],
    image: '',
    category: '',
    duration: 1,
    maxParticipants: 10,
    difficulty: 'easy',
    location: '',
    citizenPrice: 0,
    residentPrice: 0,
    nonResidentPrice: 0,
    isActive: true,
    isFeatured: false,
    featuredOrder: 0,
  });

  const categories = [
    { id: 'Wildlife', name: 'Wildlife', icon: '🦁' },
    { id: 'Cultural', name: 'Cultural', icon: '🎭' },
    { id: 'Historical', name: 'Historical', icon: '🏛️' },
    { id: 'Adventure', name: 'Adventure', icon: '🏔️' }
  ];

  const difficulties = [
    { id: 'easy', name: 'Easy' },
    { id: 'moderate', name: 'Moderate' },
    { id: 'challenging', name: 'Challenging' }
  ];

  useEffect(() => {
    fetchDestinations();
  }, []);

  // Fetch gallery items when editing a destination
  useEffect(() => {
    const loadGallery = async () => {
      if (editingDestination?.id) {
        const { data, error } = await sb
          .from('destination_media')
          .select('*')
          .eq('destination_id', editingDestination.id)
          .order('sort_order', { ascending: true });
        if (!error && data) {
          setGalleryItems(
            data.map((d: any) => ({ id: d.id, url: d.url, caption: d.caption, sort_order: d.sort_order }))
          );
        } else {
          setGalleryItems([]);
        }
      } else {
        setGalleryItems([]);
      }
    };
    loadGallery();
  }, [editingDestination]);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const { data, error } = await sb.from('destinations').select('*');
      if (!error && data) {
        setDestinations(data.map((d: any) => ({
          id: d.id,
          name: d.name,
          description: d.description,
          highlights: d.highlights || [],
          image: d.image,
          category: d.category,
          duration: d.duration,
          maxParticipants: d.max_participants,
          difficulty: d.difficulty,
          rating: d.rating,
          location: d.location,
          isActive: d.is_active,
          isFeatured: d.is_featured,
          featuredOrder: d.featured_order,
          pricing: {
            citizenPrice: d.citizen_price,
            residentPrice: d.resident_price,
            nonResidentPrice: d.non_resident_price,
          },
        })));
      } else {
        console.error('Supabase error loading destinations:', error);
        toast({
          title: 'Error',
          description: `Failed to load destinations${error?.message ? `: ${error.message}` : ''}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Unexpected error fetching destinations:', error);
      const message = error instanceof Error ? error.message : 'Failed to load destinations';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      const { error } = await sb
        .from('destinations')
        .update({ is_active: isActive })
        .eq('id', id);
      if (!error) {
        toast({
          title: 'Success',
          description: `Destination ${isActive ? 'activated' : 'deactivated'} successfully`,
        });
        fetchDestinations();
        if (user) {
          await logAdminAction({
            user_id: user.id,
            action: 'destination_toggle_active',
            entity: 'destination',
            entity_id: id,
            details: { isActive },
          });
        }
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Toggle active error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update destination status',
        variant: 'destructive',
      });
    }
  };

  const handleHighlightChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.map((highlight, i) => i === index ? value : highlight)
    }));
  };

  const handleAddHighlight = () => {
    setFormData(prev => ({
      ...prev,
      highlights: [...prev.highlights, '']
    }));
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingDestination) {
        // Update existing destination in Supabase
        const { data: updated, error } = await sb.from('destinations').update({
          name: formData.name,
          description: formData.description,
          highlights: formData.highlights.filter(h => h.trim() !== ''),
          image: formData.image,
          category: formData.category,
          duration: formData.duration,
          max_participants: formData.maxParticipants,
          difficulty: formData.difficulty,
          location: formData.location,
          citizen_price: formData.citizenPrice,
          resident_price: formData.residentPrice,
          non_resident_price: formData.nonResidentPrice,
          is_active: formData.isActive,
          is_featured: formData.isFeatured,
          featured_order: formData.featuredOrder,
        }).eq('id', editingDestination.id).select('*');
        if (!error) {
          toast({ title: 'Success', description: 'Destination updated successfully' });
          fetchDestinations();
          if (user) {
            await logAdminAction({
              user_id: user.id,
              action: 'destination_update',
              entity: 'destination',
              entity_id: editingDestination.id,
              details: { fields: formData }
            });
          }
        } else {
          toast({ title: 'Error', description: 'Failed to update destination', variant: 'destructive' });
        }
      } else {
        // Add new destination to Supabase
        const { data: inserted, error } = await sb.from('destinations').insert({
          name: formData.name,
          description: formData.description,
          highlights: formData.highlights.filter(h => h.trim() !== ''),
          image: formData.image,
          category: formData.category,
          duration: formData.duration,
          max_participants: formData.maxParticipants,
          difficulty: formData.difficulty,
          location: formData.location,
          citizen_price: formData.citizenPrice,
          resident_price: formData.residentPrice,
          non_resident_price: formData.nonResidentPrice,
          is_active: formData.isActive,
          is_featured: formData.isFeatured,
          featured_order: formData.featuredOrder,
        }).select('*');
        if (!error) {
          toast({ title: 'Success', description: 'Destination added successfully' });
          fetchDestinations();
          if (user) {
            const newId = inserted && inserted.length ? inserted[0].id : null;
            await logAdminAction({
              user_id: user.id,
              action: 'destination_create',
              entity: 'destination',
              entity_id: newId,
              details: { fields: formData }
            });
          }
        } else {
          toast({ title: 'Error', description: 'Failed to add destination', variant: 'destructive' });
        }
      }
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving destination:', error);
      toast({
        title: 'Error',
        description: 'Failed to save destination',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination);
    setFormData({
      name: destination.name,
      description: destination.description,
      highlights: destination.highlights.length > 0 ? destination.highlights : [''],
      image: destination.image,
      category: destination.category,
      duration: destination.duration || 1,
      maxParticipants: destination.maxParticipants || 10,
      difficulty: destination.difficulty || 'easy',
      location: destination.location || '',
      citizenPrice: destination.pricing.citizenPrice,
      residentPrice: destination.pricing.residentPrice,
      nonResidentPrice: destination.pricing.nonResidentPrice,
      isActive: destination.isActive ?? true,
      isFeatured: destination.isFeatured ?? false,
      featuredOrder: destination.featuredOrder ?? 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      const { error } = await sb.from('destinations').delete().eq('id', id);
      if (!error) {
        toast({ title: 'Success', description: 'Destination deleted successfully' });
        fetchDestinations();
        if (user) {
          await logAdminAction({
            user_id: user.id,
            action: 'destination_delete',
            entity: 'destination',
            entity_id: id,
          });
        }
      } else {
        toast({ title: 'Error', description: 'Failed to delete destination', variant: 'destructive' });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      highlights: [''],
      image: '',
      category: '',
      duration: 1,
      maxParticipants: 10,
      difficulty: 'easy',
      location: '',
      citizenPrice: 0,
      residentPrice: 0,
      nonResidentPrice: 0,
      isActive: true,
      isFeatured: false,
      featuredOrder: 0,
    });
    setEditingDestination(null);
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'challenging': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Bulk operations
  const handleSelectDestination = (id: number) => {
    setSelectedDestinations(prev => 
      prev.includes(id) 
        ? prev.filter(destId => destId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedDestinations.length === filteredDestinations.length) {
      setSelectedDestinations([]);
    } else {
      setSelectedDestinations(filteredDestinations.map(d => d.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDestinations.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedDestinations.length} destinations?`)) {
      return;
    }

    setBulkActionLoading(true);
    try {
      const { error } = await sb
        .from('destinations') // Use the 'sb' alias
        .delete()
        .in('id', selectedDestinations);

      if (!error) {
        toast({
          title: 'Success',
          description: `${selectedDestinations.length} destinations deleted successfully`,
        });
        setSelectedDestinations([]);
        fetchDestinations();
        if (user) {
          await logAdminAction({
            user_id: user.id,
            action: 'destination_bulk_delete',
            entity: 'destination',
            details: { ids: selectedDestinations },
          });
        }
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete destinations',
        variant: 'destructive',
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkToggleActive = async (isActive: boolean) => {
    if (selectedDestinations.length === 0) return;

    setBulkActionLoading(true);
    try {
      const { error } = await sb
        .from('destinations') // Use the 'sb' alias
        .update({ is_active: isActive })
        .in('id', selectedDestinations);

      if (!error) {
        toast({
          title: 'Success',
          description: `${selectedDestinations.length} destinations ${isActive ? 'activated' : 'deactivated'} successfully`,
        });
        setSelectedDestinations([]);
        fetchDestinations();
        if (user) {
          await logAdminAction({
            user_id: user.id,
            action: 'destination_bulk_toggle_active',
            entity: 'destination',
            details: { ids: selectedDestinations, isActive },
          });
        }
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Bulk toggle error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update destinations',
        variant: 'destructive',
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleDuplicateDestination = async (destination: Destination) => {
    try {
      const { data: inserted, error } = await sb.from('destinations').insert({ // Use the 'sb' alias
        name: `${destination.name} (Copy)`,
        description: destination.description,
        highlights: destination.highlights,
        image: destination.image,
        category: destination.category,
        duration: destination.duration,
        max_participants: destination.maxParticipants,
        difficulty: destination.difficulty,
        location: destination.location,
        citizen_price: destination.pricing.citizenPrice,
        resident_price: destination.pricing.residentPrice,
        non_resident_price: destination.pricing.nonResidentPrice,
        is_active: false, // Duplicates start as inactive
      }).select('*');

      if (!error) {
        toast({
          title: 'Success',
          description: 'Destination duplicated successfully',
        });
        fetchDestinations();
        if (user) {
          const newId = inserted && inserted.length ? inserted[0].id : null;
          await logAdminAction({
            user_id: user.id,
            action: 'destination_duplicate',
            entity: 'destination',
            entity_id: newId,
            details: { source_id: destination.id },
          });
        }
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Duplicate error:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate destination',
        variant: 'destructive',
      });
    }
  };

  // Filtering and sorting
  const filteredDestinations = destinations
    .filter(dest => {
      const matchesSearch = dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dest.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dest.location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || dest.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'price':
          return a.pricing.citizenPrice - b.pricing.citizenPrice;
        case 'created':
          return b.id - a.id; // Assuming higher ID = more recent
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader label="Loading destinations..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Destination Management</h2>
          <p className="text-muted-foreground">
            Manage your destinations, update images, pricing, and details
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Destination
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDestination ? 'Edit Destination' : 'Add New Destination'}
              </DialogTitle>
              <DialogDescription>
                {editingDestination 
                  ? 'Update the destination details below'
                  : 'Fill in the details for the new destination'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Destination Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Nairobi National Park Safari"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.icon} {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the destination experience..."
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label>Highlights</Label>
                    <div className="space-y-2">
                      {formData.highlights.map((highlight, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={highlight}
                            onChange={(e) => handleHighlightChange(index, e.target.value)}
                            placeholder="e.g., Wildlife viewing"
                          />
                          {formData.highlights.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveHighlight(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddHighlight}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Highlight
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="citizenPrice">Citizen Price (KSh)</Label>
                      <Input
                        id="citizenPrice"
                        type="number"
                        value={formData.citizenPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, citizenPrice: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="residentPrice">Resident Price (KSh)</Label>
                      <Input
                        id="residentPrice"
                        type="number"
                        value={formData.residentPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, residentPrice: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="nonResidentPrice">Non-Resident Price (KSh)</Label>
                      <Input
                        id="nonResidentPrice"
                        type="number"
                        value={formData.nonResidentPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, nonResidentPrice: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g., Nairobi, Kenya"
                      />
                    </div>
                    <div>
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.map((difficulty) => (
                            <SelectItem key={difficulty.id} value={difficulty.id}>
                              {difficulty.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">Duration (days)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: parseFloat(e.target.value) || 1 }))}
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxParticipants">Max Participants</Label>
                      <Input
                        id="maxParticipants"
                        type="number"
                        min="1"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 10 }))}
                        placeholder="10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is-featured"
                        checked={formData.isFeatured}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                      />
                      <Label htmlFor="is-featured">Feature on homepage</Label>
                    </div>
                    <div>
                      <Label htmlFor="featuredOrder">Featured Order</Label>
                      <Input
                        id="featuredOrder"
                        type="number"
                        min="0"
                        value={formData.featuredOrder}
                        onChange={(e) => setFormData(prev => ({ ...prev, featuredOrder: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-4">
                  <ImageUpload
                    value={formData.image}
                    onChange={handlePrimaryImageChange}
                    onRemove={() => setFormData(prev => ({ ...prev, image: '' }))}
                    folder="destinations"
                    maxSize={10}
                    bucket="destination-images"
                  />
                  
                  {editingDestination?.id ? (
                    <MultiImageUpload
                      destinationId={editingDestination.id}
                      items={galleryItems}
                      onItemsChange={setGalleryItems}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Save the destination first to add multiple gallery images.
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-active"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label htmlFor="is-active">Active destination (visible to users)</Label>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader size="sm" /> : (editingDestination ? 'Update Destination' : 'Add Destination')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search, Filter, and Bulk Operations */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <Input
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64"
              />
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="created">Recently Added</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedDestinations.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedDestinations.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkToggleActive(true)}
                  disabled={bulkActionLoading}
                >
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkToggleActive(false)}
                  disabled={bulkActionLoading}
                >
                  Deactivate
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkActionLoading}
                >
                  {bulkActionLoading ? <Loader size="sm" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>

          {filteredDestinations.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={selectedDestinations.length === filteredDestinations.length}
                onChange={handleSelectAll}
                className="rounded"
              />
              <Label className="text-sm">Select all ({filteredDestinations.length})</Label>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDestinations.map((destination) => (
          <Card key={destination.id} className={`overflow-hidden ${selectedDestinations.includes(destination.id) ? 'ring-2 ring-primary' : ''}`}>
            <div className="relative">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={destination.image} 
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-2 left-2">
                <input
                  type="checkbox"
                  checked={selectedDestinations.includes(destination.id)}
                  onChange={() => handleSelectDestination(destination.id)}
                  className="rounded"
                />
              </div>
              {!destination.isActive && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary">Inactive</Badge>
                </div>
              )}
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{destination.name}</CardTitle>
                <Badge className={getDifficultyColor(destination.difficulty || 'easy')}>
                  {destination.difficulty}
                </Badge>
              </div>
              <CardDescription>{destination.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {destination.location}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {destination.duration} {destination.duration === 1 ? 'day' : 'days'}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Max {destination.maxParticipants ?? '-'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{destination.rating || 0}</span>
              </div>

              <div className="text-sm">
                <div className="font-medium mb-1">Pricing:</div>
                <div className="space-y-1 text-muted-foreground">
                  <div>Citizen: KSh {destination.pricing.citizenPrice.toLocaleString()}</div>
                  <div>Resident: KSh {destination.pricing.residentPrice.toLocaleString()}</div>
                  <div>Non-Resident: KSh {destination.pricing.nonResidentPrice.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(destination)}
                  className="flex-1"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicateDestination(destination)}
                  className="flex-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(destination.id, !destination.isActive)}
                  className="flex-1"
                >
                  {destination.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(destination.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {destinations.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No destinations yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first destination
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Destination
          </Button>
        </div>
      )}
    </div>
  );
};

export default DestinationManagement;
