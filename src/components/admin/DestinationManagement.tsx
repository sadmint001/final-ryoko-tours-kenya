// src/components/admin/DestinationManagement.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Clock,
  Users,
  Star,
  Copy,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { logAdminAction } from '@/services/activityLog';
import { supabase } from '@/integrations/supabase/client';
import Loader from '@/components/ui/loader';
import ImageUpload from './ImageUpload';
import MultiImageUpload, { GalleryItem } from './MultiImageUpload';

type SupabaseAny = any;
const sb: SupabaseAny = supabase;
const IMAGE_BUCKET = 'destination-images';

interface Destination {
  id: number;
  name: string;
  description: string;
  highlights: string[];
  image: string;
  category: string;
  duration?: number;
  maxParticipants?: number;
  difficulty?: string;
  rating?: number;
  location?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  featuredOrder?: number;
  pricing: {
    citizenPrice: number;
    residentPrice: number;
    nonResidentPrice: number;
  };
}

const categories = [
  { id: 'Wildlife', name: 'Wildlife', icon: '🦁' },
  { id: 'Cultural', name: 'Cultural', icon: '🎭' },
  { id: 'Historical', name: 'Historical', icon: '🏛️' },
  { id: 'Adventure', name: 'Adventure', icon: '🏔️' },
];

const difficulties = [
  { id: 'easy', name: 'Easy' },
  { id: 'moderate', name: 'Moderate' },
  { id: 'challenging', name: 'Challenging' },
];

const DestinationManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  const initialForm = {
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
  };
  const [formData, setFormData] = useState(initialForm);

  // Map DB row to model
  const mapRow = (d: any): Destination => ({
    id: d.id,
    name: d.name,
    description: d.description,
    highlights: d.highlights || [],
    image: d.image || '',
    category: d.category,
    duration: d.duration ?? undefined,
    maxParticipants: d.max_participants ?? undefined,
    difficulty: d.difficulty ?? undefined,
    rating: d.rating ?? undefined,
    location: d.location ?? undefined,
    isActive: d.is_active ?? false,
    isFeatured: d.is_featured ?? false,
    featuredOrder: d.featured_order ?? 0,
    pricing: {
      citizenPrice: d.citizen_price ?? 0,
      residentPrice: d.resident_price ?? 0,
      nonResidentPrice: d.non_resident_price ?? 0,
    },
  });

  // Fetch destinations
  const fetchDestinations = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await sb
        .from('destinations')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: true });

      if (error) {
        console.error('Supabase fetch error:', error);
        toast?.error?.('Failed to load destinations');
        return;
      }

      const mapped = (data || []).map((d: any) => mapRow(d));
      setDestinations(mapped);
    } catch (err) {
      console.error('Failed to load destinations:', err);
      toast?.error?.('Failed to load destinations');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  // Load gallery for editing destination
  useEffect(() => {
    const loadGallery = async () => {
      if (!editingDestination?.id) {
        setGalleryItems([]);
        return;
      }
      try {
        const { data, error } = await sb
          .from('destination_media')
          .select('*')
          .eq('destination_id', editingDestination.id)
          .order('sort_order', { ascending: true });
        if (!error && data) {
          setGalleryItems(data.map((d: any) => ({ id: d.id, url: d.url, caption: d.caption, sort_order: d.sort_order })));
        } else {
          setGalleryItems([]);
        }
      } catch (e) {
        console.error('Gallery load failed', e);
        setGalleryItems([]);
      }
    };
    loadGallery();
  }, [editingDestination]);

  // Reset form
  const resetForm = () => {
    setFormData(initialForm);
    setEditingDestination(null);
    setGalleryItems([]);
  };

  // Open create dialog
  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Open edit dialog and populate form
  const openEditDialog = (dest: Destination) => {
    setEditingDestination(dest);
    setFormData({
      name: dest.name,
      description: dest.description,
      highlights: dest.highlights.length > 0 ? dest.highlights : [''],
      image: dest.image,
      category: dest.category,
      duration: dest.duration ?? 1,
      maxParticipants: dest.maxParticipants ?? 10,
      difficulty: dest.difficulty ?? 'easy',
      location: dest.location ?? '',
      citizenPrice: dest.pricing.citizenPrice ?? 0,
      residentPrice: dest.pricing.residentPrice ?? 0,
      nonResidentPrice: dest.pricing.nonResidentPrice ?? 0,
      isActive: dest.isActive ?? true,
      isFeatured: dest.isFeatured ?? false,
      featuredOrder: dest.featuredOrder ?? 0,
    });
    setIsDialogOpen(true);
  };

  // Save primary image immediately when changed (if editing)
  const handlePrimaryImageChange = async (url: string) => {
    setFormData((p) => ({ ...p, image: url }));
    if (!editingDestination?.id) return;
    try {
      const { data, error } = await sb.from('destinations').update({ image: url }).eq('id', editingDestination.id).select('*');
      if (error) throw error;
      if (!data || data.length === 0) {
        toast({ title: 'Warning', description: 'No record updated', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Primary image saved' });
        await fetchDestinations();
        if (user) {
          await logAdminAction({ user_id: user.id, action: 'destination_update_image', entity: 'destination', entity_id: editingDestination.id, details: { image: url } });
        }
      }
    } catch (err) {
      console.error('Image save failed', err);
      toast({ title: 'Error', description: 'Failed to save image', variant: 'destructive' });
    }
  };

  // Create / Update
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);

    if (!formData.name || !formData.description) {
      toast?.error?.('Name and description are required');
      setSaving(false);
      return;
    }

    try {
      // Prepare row using DB column names (snake_case)
      const payload = {
        name: formData.name,
        description: formData.description,
        highlights: formData.highlights,
        image: formData.image,
        category: formData.category,
        duration: formData.duration,
        max_participants: formData.maxParticipants,
        difficulty: formData.difficulty,
        location: formData.location,
        is_active: formData.isActive,
        is_featured: formData.isFeatured,
        featured_order: formData.featuredOrder,
        citizen_price: formData.citizenPrice,
        resident_price: formData.residentPrice,
        non_resident_price: formData.nonResidentPrice,
      };

      if (editingDestination && editingDestination.id) {
        const { data, error } = await sb
          .from('destinations')
          .update(payload)
          .eq('id', editingDestination.id)
          .select()
          .single();

        if (error) throw error;
        toast?.success?.('Destination updated');
      } else {
        const { data, error } = await sb.from('destinations').insert(payload).select().single();
        if (error) throw error;
        toast?.success?.('Destination created');
      }

      // Refresh list after change
      await fetchDestinations();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error('Save failed:', err);
      toast?.error?.('Save failed');
    } finally {
      setSaving(false);
    }
  };

  // Delete (hard delete). If you soft-delete, use update({ is_active: false }) instead.
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this destination?')) return;
    try {
      const { data, error } = await sb.from('destinations').delete().eq('id', id).select();
      if (error) throw error;

      // Supabase may return [] when no rows affected — check data
      if (!data || (Array.isArray(data) && data.length === 0)) {
        toast?.error?.('Delete returned no rows');
      } else {
        toast?.success?.('Deleted successfully');
      }

      // Refresh
      await fetchDestinations();
    } catch (err) {
      console.error('Delete failed:', err);
      toast?.error?.('Delete failed');
    }
  };

  // Toggle active (optimistic)
  const handleToggleActive = async (id: number, isActive: boolean) => {
    const prev = destinations;
    setDestinations((cur) => cur.map((d) => (d.id === id ? { ...d, isActive } : d)));

    try {
      const { data, error } = await sb
        .from('destinations')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      toast?.success?.(isActive ? 'Activated' : 'Deactivated');
      // ensure canonical list
      await fetchDestinations();
    } catch (err) {
      console.error('Toggle failed:', err);
      toast?.error?.('Failed to update active state');
      setDestinations(prev); // revert
    }
  };

  // Duplicate destination
  const handleDuplicate = async (dest: Destination) => {
    try {
      const payload = {
        name: `${dest.name} (Copy)`,
        description: dest.description,
        highlights: dest.highlights,
        image: dest.image,
        category: dest.category,
        duration: dest.duration,
        max_participants: dest.maxParticipants,
        difficulty: dest.difficulty,
        location: dest.location,
        is_active: false, // duplicated as inactive by default
        is_featured: false,
        featured_order: 0,
        citizen_price: dest.pricing.citizenPrice,
        resident_price: dest.pricing.residentPrice,
        non_resident_price: dest.pricing.nonResidentPrice,
      };
      const { data, error } = await sb.from('destinations').insert(payload).select().single();
      if (error) throw error;
      toast?.success?.('Duplicate created');
      await fetchDestinations();
    } catch (err) {
      console.error('Duplicate failed:', err);
      toast?.error?.('Duplicate failed');
    }
  };

  // Difficulty color helper
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'challenging': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
          <p className="text-muted-foreground">Manage your destinations, update images, pricing, and details</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Destination
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDestination ? 'Edit Destination' : 'Add New Destination'}</DialogTitle>
              <DialogDescription>
                {editingDestination ? 'Update the destination details below' : 'Fill in the details for the new destination'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
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
                      <Input id="name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} placeholder="e.g., Nairobi National Park Safari" required />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} rows={4} required />
                  </div>

                  <div>
                    <Label>Highlights</Label>
                    <div className="space-y-2">
                      {formData.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input value={highlight} onChange={(e) => setFormData((p) => ({ ...p, highlights: p.highlights.map((h, i) => i === idx ? e.target.value : h) }))} placeholder="e.g., Wildlife viewing" />
                          {formData.highlights.length > 1 && (
                            <Button type="button" variant="outline" size="sm" onClick={() => setFormData((p) => ({ ...p, highlights: p.highlights.filter((_, i) => i !== idx) }))}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => setFormData((p) => ({ ...p, highlights: [...p.highlights, ''] }))}>
                        <Plus className="mr-2 h-4 w-4" /> Add Highlight
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="citizenPrice">Citizen Price (KSh)</Label>
                      <Input id="citizenPrice" type="number" value={formData.citizenPrice} onChange={(e) => setFormData((p) => ({ ...p, citizenPrice: parseInt(e.target.value || '0') }))} required />
                    </div>
                    <div>
                      <Label htmlFor="residentPrice">Resident Price (KSh)</Label>
                      <Input id="residentPrice" type="number" value={formData.residentPrice} onChange={(e) => setFormData((p) => ({ ...p, residentPrice: parseInt(e.target.value || '0') }))} required />
                    </div>
                    <div>
                      <Label htmlFor="nonResidentPrice">Non-Resident Price (KSh)</Label>
                      <Input id="nonResidentPrice" type="number" value={formData.nonResidentPrice} onChange={(e) => setFormData((p) => ({ ...p, nonResidentPrice: parseInt(e.target.value || '0') }))} required />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" value={formData.location} onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select value={formData.difficulty} onValueChange={(v) => setFormData((p) => ({ ...p, difficulty: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">Duration (days)</Label>
                      <Input id="duration" type="number" step="0.5" value={formData.duration} onChange={(e) => setFormData((p) => ({ ...p, duration: parseFloat(e.target.value || '1') }))} />
                    </div>
                    <div>
                      <Label htmlFor="maxParticipants">Max Participants</Label>
                      <Input id="maxParticipants" type="number" value={formData.maxParticipants} onChange={(e) => setFormData((p) => ({ ...p, maxParticipants: parseInt(e.target.value || '10') }))} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-center">
                    <div className="flex items-center space-x-2">
                      <Switch id="isFeatured" checked={formData.isFeatured} onCheckedChange={(c) => setFormData((p) => ({ ...p, isFeatured: c }))} />
                      <Label htmlFor="isFeatured">Feature on homepage</Label>
                    </div>
                    <div>
                      <Label htmlFor="featuredOrder">Featured Order</Label>
                      <Input id="featuredOrder" type="number" value={formData.featuredOrder} onChange={(e) => setFormData((p) => ({ ...p, featuredOrder: parseInt(e.target.value || '0') }))} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-4">
                  <ImageUpload value={formData.image} onChange={handlePrimaryImageChange} onRemove={() => setFormData((p) => ({ ...p, image: '' }))} folder="destinations" maxSize={10} bucket={IMAGE_BUCKET} />

                  {editingDestination?.id ? (
                    <MultiImageUpload destinationId={editingDestination.id} items={galleryItems} onItemsChange={setGalleryItems} />
                  ) : (
                    <div className="text-sm text-muted-foreground">Save the destination first to add gallery images.</div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch id="isActive" checked={formData.isActive} onCheckedChange={(c) => setFormData((p) => ({ ...p, isActive: c }))} />
                    <Label htmlFor="isActive">Active destination (visible to users)</Label>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? <Loader size="sm" /> : editingDestination ? 'Update Destination' : 'Add Destination'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Controls & grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {destinations.map((dest) => (
          <Card key={dest.id}>
            <div className="relative">
              <div className="aspect-video overflow-hidden">
                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
              </div>
              {!dest.isActive && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary">Inactive</Badge>
                </div>
              )}
            </div>

            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{dest.name}</CardTitle>
                <Badge className={getDifficultyColor(dest.difficulty || 'easy')}>{dest.difficulty || 'N/A'}</Badge>
              </div>
              <CardDescription>{dest.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{dest.location}</div>
                <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{dest.duration ?? '-'} {dest.duration === 1 ? 'day' : 'days'}</div>
                <div className="flex items-center gap-1"><Users className="w-4 h-4" />Max {dest.maxParticipants ?? '-'}</div>
              </div>

              <div className="text-sm">
                <div className="font-medium mb-1">Pricing:</div>
                <div className="space-y-1 text-muted-foreground">
                  <div>Citizen: KSh {dest.pricing.citizenPrice.toLocaleString()}</div>
                  <div>Resident: KSh {dest.pricing.residentPrice.toLocaleString()}</div>
                  <div>Non-Resident: KSh {dest.pricing.nonResidentPrice.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(dest)} className="flex-1"><Edit className="mr-2 h-4 w-4" />Edit</Button>
                <Button variant="outline" size="sm" onClick={() => handleDuplicate(dest)} className="flex-1"><Copy className="mr-2 h-4 w-4" />Duplicate</Button>
                <Button variant="outline" size="sm" onClick={() => handleToggleActive(dest.id, !dest.isActive)} className="flex-1">{dest.isActive ? 'Deactivate' : 'Activate'}</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(dest.id)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {destinations.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No destinations yet</h3>
          <p className="text-muted-foreground mb-4">Get started by adding your first destination</p>
          <Button onClick={() => setIsDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Destination</Button>
        </div>
      )}
    </div>
  );
};

export default DestinationManagement;
