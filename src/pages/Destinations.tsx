import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Star, ExternalLink, Filter } from 'lucide-react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/ui/loader';
import ResidencySelector from '@/components/ResidencySelector';
import { getPriceByResidency, formatPrice } from '@/lib/pricing';
import { useResidency } from '@/contexts/ResidencyContext';
import { supabase } from '@/integrations/supabase/client';



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
  updatedAt?: string;
}

const Destinations = () => {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recommended');
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedResidency, setSelectedResidency } = useResidency();



  // Load destinations and tours from Supabase so admin updates reflect on this page
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Use untyped alias to avoid TS table name limitations if types are outdated
        const sb: any = supabase;
        const { data, error } = await sb
          .from('destinations')
          .select('*')
          .eq('is_active', true)
          .order('id', { ascending: true });
        if (error) throw error;
        const mapped: Destination[] = (data || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          description: d.description,
          highlights: d.highlights || [],
          image: d.image,
          pricing: {
            citizenPrice: d.citizen_price,
            residentPrice: d.resident_price,
            nonResidentPrice: d.non_resident_price,
          },
          category: d.category,
          duration: d.duration ?? undefined,
          maxParticipants: d.max_participants ?? undefined,
          difficulty: d.difficulty ?? undefined,
          rating: d.rating ?? undefined,
          location: d.location ?? undefined,
          updatedAt: d.updated_at ?? undefined,
        }));
        setAllDestinations(mapped);
      } catch (e) {
        console.error('Failed to load destinations:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categories = [
    { id: 'all', name: 'All Experiences', icon: '🌟' },
    { id: 'Wildlife', name: 'Wildlife', icon: '🦁' },
    { id: 'Cultural', name: 'Cultural', icon: '🎭' },
    { id: 'Historical', name: 'Historical', icon: '🏛️' },
    { id: 'Adventure', name: 'Adventure', icon: '🏔️' }
  ];



  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'challenging': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  // Read filters from URL on mount / change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const sortParam = params.get('sort');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (sortParam) {
      setSortBy(sortParam);
    }
  }, [location.search]);

  // Keep URL in sync when user changes filters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (selectedCategory && selectedCategory !== params.get('category')) {
      if (selectedCategory === 'all') {
        params.delete('category');
      } else {
        params.set('category', selectedCategory);
      }
    }
    if (sortBy && sortBy !== params.get('sort')) {
      if (sortBy === 'recommended') {
        params.delete('sort');
      } else {
        params.set('sort', sortBy);
      }
    }
    navigate({ pathname: location.pathname, search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
  }, [selectedCategory, sortBy]);

  // Filter and sort
  const filteredDestinationsBase = selectedCategory === 'all' 
    ? allDestinations 
    : allDestinations.filter(dest => dest.category === selectedCategory);

  const filteredDestinations = [...filteredDestinationsBase].sort((a, b) => {
    switch (sortBy) {
      case 'priceAsc':
        return a.pricing.citizenPrice - b.pricing.citizenPrice;
      case 'priceDesc':
        return b.pricing.citizenPrice - a.pricing.citizenPrice;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'duration':
        return (a.duration || 0) - (b.duration || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader label="Loading destinations..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/10">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
            Discover Kenya
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Embark on unforgettable adventures across the most spectacular destinations in Kenya
          </p>
        </div>

        {/* Residency Selection */}
        <ResidencySelector 
          selectedResidency={selectedResidency}
          onResidencyChange={setSelectedResidency}
        />

        {/* Category Filter and Sort */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold text-muted-foreground">Filter by:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                <span>{category.icon}</span>
                {category.name}
              </Button>
            ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 rounded-md border bg-background px-3 text-sm"
              >
                <option value="recommended">Recommended</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="duration">Shortest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDestinations.map((destination) => (
            <Card key={destination.id} className="group hover:shadow-elegant transition-all duration-300 overflow-hidden">
              <div className="aspect-video overflow-hidden relative">
                <img 
                  src={destination.updatedAt ? `${destination.image}?v=${new Date(destination.updatedAt).getTime()}` : destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {destination.rating && (
                  <div className="absolute top-4 right-4 bg-white/90 px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4 text-safari-gold fill-current" />
                    <span className="text-sm font-medium">{destination.rating}</span>
                  </div>
                )}
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-display group-hover:text-primary transition-colors">
                    {destination.name}
                  </CardTitle>
                  {destination.difficulty && (
                    <Badge className={getDifficultyColor(destination.difficulty)}>
                      {destination.difficulty}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm">
                  {destination.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {destination.location || destination.name}
                  </div>
                  {destination.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {destination.duration} {destination.duration < 1 ? 'hours' : destination.duration === 1 ? 'day' : 'days'}
                    </div>
                  )}
                  {destination.maxParticipants && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Max {destination.maxParticipants}
                    </div>
                  )}
                </div>

                {/* Highlights */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2 text-sm">Highlights:</h4>
                  <div className="flex flex-wrap gap-1">
                    {destination.highlights.slice(0, 3).map((highlight, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                    {destination.highlights.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{destination.highlights.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="text-center w-full bg-slate-50 dark:bg-white text-black p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-300">
                  {selectedResidency ? (
                    <>
                      <div className="text-sm text-black dark:text-black font-medium">Starting from</div>
                      <div className="text-2xl font-bold text-primary dark:text-black">
                        {formatPrice(getPriceByResidency(destination.pricing, selectedResidency))}
                        <span className="text-sm font-normal text-black dark:text-black ml-1">
                          per person
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-black dark:text-black font-medium">Starting from</div>
                      <div className="text-lg text-black dark:text-black italic">
                        per person
                      </div>
                      <Button 
                        className="mt-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 transition-all text-sm text-white font-medium"
                        onClick={() => setSelectedResidency('citizen')}
                      >
                        Select Residency
                      </Button>
                    </>
                  )}
                </div>

                <div className="flex gap-3">
                  <Link to={`/booking?destination=${destination.id}`} className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 transition-all text-black font-medium">
                      Book Now
                    </Button>
                  </Link>
                  <Button variant="outline" className="flex-1 border-orange-500 text-orange-600 hover:bg-orange-50">
                    View Details
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDestinations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No destinations found for the selected category.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSelectedCategory('all')}
            >
              View All Destinations
            </Button>
          </div>
        )}

        {/* Pricing banner - updated text */}
        <div
          style={{
            background: "linear-gradient(90deg, #f7971e 0%, #ffd200 100%)",
            borderRadius: "16px",
            padding: "16px 32px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ color: "#222", fontWeight: 500, fontSize: "18px" }}>
            Tour prices
          </span>
          <button
            style={{
              background: "#fff",
              color: "#222",
              border: "none",
              borderRadius: "20px",
              padding: "8px 20px",
              fontWeight: 500,
              cursor: "pointer",
            }}
            onClick={() => setSelectedResidency('citizen')}
          >
            Select Residency
          </button>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default Destinations;
