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
import { MapPin, Plus, Edit, Trash2, Image as ImageIcon, DollarSign, Clock, Users, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Loader from '@/components/ui/loader';

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
}

const DestinationManagement = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

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
    isActive: true
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

  const fetchDestinations = async () => {
    try {
      // For now, we'll use the static data from the booking page
      // In a real app, this would fetch from the database
      const staticDestinations: Destination[] = [
        {
          id: 1,
          name: "Nairobi National Park Safari",
          description: "Experience Kenya's wildlife just minutes from the city center",
          highlights: ["Wildlife viewing", "Safari drives", "Photography"],
          image: "/lovable-uploads/73327ee8-9c0a-46bc-bb2d-790af95674a4.png",
          pricing: {
            citizenPrice: 2500,
            residentPrice: 3500,
            nonResidentPrice: 8500
          },
          category: "Wildlife",
          duration: 1,
          maxParticipants: 8,
          difficulty: "easy",
          rating: 4.9,
          location: "Nairobi",
          isActive: true
        }
      ];
      
      setDestinations(staticDestinations);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load destinations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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

  const handleHighlightChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.map((highlight, i) => i === index ? value : highlight)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const destinationData = {
        ...formData,
        highlights: formData.highlights.filter(h => h.trim() !== ''),
        pricing: {
          citizenPrice: formData.citizenPrice,
          residentPrice: formData.residentPrice,
          nonResidentPrice: formData.nonResidentPrice
        }
      };

      if (editingDestination) {
        // Update existing destination
        const updatedDestinations = destinations.map(dest => 
          dest.id === editingDestination.id 
            ? { ...destinationData, id: dest.id, rating: dest.rating }
            : dest
        );
        setDestinations(updatedDestinations);
        toast({
          title: 'Success',
          description: 'Destination updated successfully',
        });
      } else {
        // Add new destination
        const newDestination: Destination = {
          ...destinationData,
          id: Date.now(), // In real app, this would be from the database
          rating: 0
        };
        setDestinations(prev => [...prev, newDestination]);
        toast({
          title: 'Success',
          description: 'Destination added successfully',
        });
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
      isActive: destination.isActive ?? true
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      try {
        setDestinations(prev => prev.filter(dest => dest.id !== id));
        toast({
          title: 'Success',
          description: 'Destination deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting destination:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete destination',
          variant: 'destructive',
        });
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
      isActive: true
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
                </TabsContent>

                <TabsContent value="media" className="space-y-4">
                  <div>
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.image && (
                      <div className="mt-2">
                        <img 
                          src={formData.image} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-lg border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {destinations.map((destination) => (
          <Card key={destination.id} className="overflow-hidden">
            <div className="aspect-video overflow-hidden">
              <img 
                src={destination.image} 
                alt={destination.name}
                className="w-full h-full object-cover"
              />
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
                  Max {destination.maxParticipants}
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

              <div className="flex gap-2">
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
