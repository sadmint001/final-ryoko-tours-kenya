import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, ExternalLink, Filter, ArrowLeft } from 'lucide-react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/ui/loader';
import { getPriceByResidency, formatPrice } from '@/lib/pricing';
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
  location?: string;
  updatedAt?: string;
}

const Destinations: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [selectedResidency, setSelectedResidency] = useState<string | null>(() => {
    // Check sessionStorage first (cleared when tab closes)
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('destinationResidency');
      return stored;
    }
    return null;
  });

  const location = useLocation();
  const navigate = useNavigate();
  const residencyMenuRef = useRef<HTMLDivElement | null>(null);
  const [showResidencyMenu, setShowResidencyMenu] = useState<boolean>(false);

  const residencyOptions = [
    { key: 'citizen', label: 'Kenyan Citizen' },
    { key: 'resident', label: 'Kenyan Resident (Non-citizen living or working in Kenya)' },
    { key: 'nonResident', label: 'Non-resident / International Visitor' },
  ];

  // Handle browser back button
  useEffect(() => {
    const handleBackButton = (event: PopStateEvent) => {
      if (selectedResidency) {
        // Clear residency and stay on page
        clearResidency();
        // Prevent default back navigation
        event.preventDefault();
        // Update URL without navigating
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    // Add initial history state
    window.history.pushState(null, '', window.location.href);

    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [selectedResidency, navigate]);

  // Clear session data when leaving page
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('destinationResidency');
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Optional: Clear after user leaves page
        setTimeout(() => {
          if (document.visibilityState === 'hidden') {
            sessionStorage.removeItem('destinationResidency');
          }
        }, 30000); // Clear after 30 seconds of being away
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleSelectResidency = useCallback((key: string) => {
    // Store in sessionStorage (cleared when browser/tab closes)
    sessionStorage.setItem('destinationResidency', key);
    setSelectedResidency(key);
    setShowResidencyMenu(false);
  }, []);

  const clearResidency = useCallback(() => {
    sessionStorage.removeItem('destinationResidency');
    setSelectedResidency(null);
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (residencyMenuRef.current && !residencyMenuRef.current.contains(e.target as Node)) {
        setShowResidencyMenu(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    let mounted = true;
    const sb: any = supabase;
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await sb
          .from('destinations')
          .select('*')
          .eq('is_active', true)
          .order('id', { ascending: true });
        if (error) throw error;
        if (!mounted) return;
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
          location: d.location ?? undefined,
          updatedAt: d.updated_at ?? undefined,
        }));
        setAllDestinations(mapped);
      } catch (err) {
        console.error('Failed to load destinations', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    const channel = (supabase as any)
      .channel('public:destinations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'destinations' },
        () => { load(); }
      )
      .subscribe();

    return () => {
      mounted = false;
      try { channel.unsubscribe(); } catch {}
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const c = params.get('category');
    const s = params.get('sort');
    if (c) setSelectedCategory(c);
    if (s) setSortBy(s);
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (selectedCategory && selectedCategory !== params.get('category')) {
      if (selectedCategory === 'all') params.delete('category'); else params.set('category', selectedCategory);
    }
    if (sortBy && sortBy !== params.get('sort')) {
      if (sortBy === 'recommended') params.delete('sort'); else params.set('sort', sortBy);
    }
    navigate({ pathname: location.pathname, search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
  }, [selectedCategory, sortBy, location.pathname, location.search, navigate]);

  const filtered = selectedCategory === 'all'
    ? allDestinations
    : allDestinations.filter(d => d.category === selectedCategory);

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'priceAsc': return (a.pricing.citizenPrice || 0) - (b.pricing.citizenPrice || 0);
      case 'priceDesc': return (b.pricing.citizenPrice || 0) - (a.pricing.citizenPrice || 0);
      case 'duration': return (a.duration || 0) - (b.duration || 0);
      default: return 0;
    }
  });

  // Custom price formatting function based on residency
  const formatPriceByResidency = (price: number, residency: string) => {
    if (residency === 'citizen') {
      return `KSh ${price.toLocaleString()}`;
    } else {
      return `$${price.toLocaleString()}`;
    }
  };

  // Manual back button handler
  const handleManualBack = () => {
    clearResidency();
  };

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

  // Block page until residency selected
  if (!selectedResidency) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/10">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-3xl font-display font-bold text-primary">Please Confirm your Status in Kenya</h2>
            
            <div ref={residencyMenuRef} className="relative">
              <Button
                className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-2 rounded-full"
                onClick={() => setShowResidencyMenu(s => !s)}
              >
                Select Residency
              </Button>

              {showResidencyMenu && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden border border-gray-200">
                  {residencyOptions.map((opt) => (
                    <button
                      key={opt.key}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 text-sm text-black border-b border-gray-100 last:border-b-0"
                      onClick={() => handleSelectResidency(opt.key)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/10">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleManualBack}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Residency Selection
          </Button>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary">Discover Kenya</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Embark on unforgettable adventures across the most spectacular destinations in Kenya
          </p>
        </div>

        {/* Pricing banner - REMOVED GO BACK BUTTON */}
        <div className="mb-6 w-full">
          <div
            className="mx-auto w-full max-w-4xl rounded-2xl p-4 sm:p-6"
            style={{ background: 'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)' }}
          >
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="text-sm font-medium text-black">Residency:</div>
                <div className="bg-white px-3 py-1 rounded-full font-medium text-black text-sm">
                  {selectedResidency === 'nonResident' ? 'Non-resident / International Visitor' : 
                   selectedResidency === 'resident' ? 'Kenyan Resident' : 'Kenyan Citizen'}
                </div>
                <div className="text-sm font-medium text-black">
                  Currency: {selectedResidency === 'citizen' ? 'KSh' : 'USD'}
                </div>
              </div>

              {/* Removed Go Back Button */}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold text-muted-foreground">Filter by:</span>
          </div>

          <div className="overflow-x-auto w-full sm:w-auto">
            <div className="inline-flex gap-3 py-2">
              {[
                { id: 'all', name: 'All Experiences' },
                { id: 'Wildlife', name: 'Wildlife' },
                { id: 'Cultural', name: 'Cultural' },
                { id: 'Historical', name: 'Historical' },
                { id: 'Adventure', name: 'Adventure' },
              ].map(c => (
                <Button
                  key={c.id}
                  variant={selectedCategory === c.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(c.id)}
                  className="whitespace-nowrap"
                >
                  {c.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-3 sm:mt-0 sm:ml-auto flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-muted-foreground hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-sm w-full sm:w-auto"
            >
              <option value="recommended">Recommended</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="duration">Shortest First</option>
            </select>
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sorted.map(dest => (
            <Card key={dest.id} className="group hover:shadow-elegant transition-all duration-300 overflow-hidden">
              <div className="aspect-video overflow-hidden relative">
                <img
                  src={dest.updatedAt ? `${dest.image}?v=${new Date(dest.updatedAt).getTime()}` : dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <CardHeader>
                <div className="mb-2">
                  <CardTitle className="text-xl font-display group-hover:text-primary transition-colors">{dest.name}</CardTitle>
                </div>
                <CardDescription className="text-sm">{dest.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{dest.location || dest.name}</div>
                  {dest.duration && <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{dest.duration} {dest.duration === 1 ? 'day' : 'days'}</div>}
                  {dest.maxParticipants && <div className="flex items-center gap-1"><Users className="w-4 h-4" />Max {dest.maxParticipants}</div>}
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2 text-sm">Highlights:</h4>
                  <div className="flex flex-wrap gap-1">
                    {dest.highlights.slice(0, 3).map((h, i) => <Badge key={i} variant="outline" className="text-xs">{h}</Badge>)}
                    {dest.highlights.length > 3 && <Badge variant="outline" className="text-xs">+{dest.highlights.length - 3} more</Badge>}
                  </div>
                </div>

                {selectedResidency && (
                  <div className="text-center w-full bg-slate-50 dark:bg-white p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-300">
                    <div className="text-sm font-medium" style={{ color: '#000' }}>As low as</div>
                    <div className="text-lg font-bold" style={{ color: '#f97316' }}>
                      {formatPriceByResidency(getPriceByResidency(dest.pricing, selectedResidency), selectedResidency)}
                      <span className="text-sm font-normal ml-1" style={{ color: '#000' }}>per person</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Link to={`/booking?destination=${dest.id}&residency=${selectedResidency}`} className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-medium">Book Now</Button>
                  </Link>
                  <Button variant="outline" className="flex-1 border-orange-500 text-orange-600 hover:bg-orange-50">
                    View Details <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sorted.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No destinations found for the selected category.</p>
            <Button variant="outline" className="mt-4" onClick={() => setSelectedCategory('all')}>View All Destinations</Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Destinations;