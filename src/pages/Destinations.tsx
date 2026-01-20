import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, ExternalLink, Filter, ArrowLeft, Search, Sparkles, Globe, ChevronDown, Check } from 'lucide-react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/ui/loader';
import { getPriceByResidency } from '@/lib/pricing';
import { supabase } from '@/integrations/supabase/client';
import { useResidencyPersistence } from '@/hooks/useResidencyPersistence';
import { getResidencyDisplay, getCurrency, formatPriceByResidency } from '@/lib/residencyUtils';

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
  const [showResidencyMenu, setShowResidencyMenu] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Hero Image Carousel State
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const heroImages = Object.values(
    import.meta.glob('@/assets/dest-hero*.{jpg,png}', { eager: true, import: 'default' })
  ) as string[];

  const { selectedResidency, setResidency, clearResidency } = useResidencyPersistence();
  const location = useLocation();
  const navigate = useNavigate();
  const residencyMenuRef = useRef<HTMLDivElement | null>(null);

  const residencyOptions = [
    { key: 'citizen', label: 'Kenyan Citizen' },
    { key: 'resident', label: 'Kenyan Resident' },
    { key: 'nonResident', label: 'International Visitor' },
  ];

  // Auto-rotate hero images
  useEffect(() => {
    if (heroImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroImages.length]);

  // Handle browser back button
  useEffect(() => {
    const handleBackButton = (event: PopStateEvent) => {
      if (selectedResidency) {
        clearResidency();
        event.preventDefault();
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [selectedResidency, clearResidency]);

  // Clear session data when leaving page
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('destinationResidency');
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setTimeout(() => {
          if (document.visibilityState === 'hidden') {
            sessionStorage.removeItem('destinationResidency');
          }
        }, 30000);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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

  const handleSelectResidency = useCallback((key: string) => {
    setResidency(key);
    setShowResidencyMenu(false);
  }, [setResidency]);

  const handleManualBack = () => {
    clearResidency();
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
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

    const channel = supabase
      .channel('public:destinations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'destinations' },
        () => { load(); }
      )
      .subscribe();

    return () => {
      mounted = false;
      channel.unsubscribe();
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
      if (selectedCategory === 'all') params.delete('category');
      else params.set('category', selectedCategory);
    }
    if (sortBy && sortBy !== params.get('sort')) {
      if (sortBy === 'recommended') params.delete('sort');
      else params.set('sort', sortBy);
    }
    navigate({ pathname: location.pathname, search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
  }, [selectedCategory, sortBy, location.pathname, location.search, navigate]);

  const filtered = allDestinations.filter(d => {
    const matchesCategory = selectedCategory === 'all' || d.category === selectedCategory;
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'priceAsc': return (a.pricing.citizenPrice || 0) - (b.pricing.citizenPrice || 0);
      case 'priceDesc': return (b.pricing.citizenPrice || 0) - (a.pricing.citizenPrice || 0);
      case 'duration': return (a.duration || 0) - (b.duration || 0);
      default: return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
        <Navbar />

        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full blur-3xl"></div>
        </div>

        <main className="container mx-auto px-4 py-20 relative z-10 flex flex-col items-center justify-center min-h-[80vh]">
          <div className="max-w-xl w-full text-center space-y-8 p-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/10">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg rotate-3 mb-6">
              <Globe className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 dark:text-white">
              Karibu Kenya
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              To show you the best customized rates, please confirm your residency status.
            </p>

            <div ref={residencyMenuRef} className="relative w-full max-w-sm mx-auto">
              <Button
                className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                onClick={() => setShowResidencyMenu(s => !s)}
              >
                <span>Select Residency</span>
                <ChevronDown className={`ml-2 w-5 h-5 transition-transform duration-300 ${showResidencyMenu ? 'rotate-180' : ''}`} />
              </Button>

              {showResidencyMenu && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
                  {residencyOptions.map((opt) => (
                    <button
                      key={opt.key}
                      className="w-full text-left px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition-colors flex items-center justify-between group"
                      onClick={() => handleSelectResidency(opt.key)}
                    >
                      <span className="font-medium">{opt.label}</span>
                      <Check className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-24 overflow-hidden min-h-[60vh] flex items-center">
        {/* Background Image Carousel */}
        <div className="absolute inset-0 z-0">
          {heroImages.length > 0 ? (
            heroImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${index === currentHeroIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                style={{ backgroundImage: `url(${image})` }}
              >
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-50 dark:to-slate-900" />
                {/* Gradient overlay to seamlessly merge with body */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 dark:from-slate-900 to-transparent" />
              </div>
            ))
          ) : (
            // Fallback if no images found
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-600/10 dark:from-slate-900 dark:to-slate-800"></div>
          )}
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              className="group flex items-center gap-2 text-white/80 hover:text-white transition-colors pl-0 hover:bg-white/10 rounded-full px-4"
              onClick={handleManualBack}
            >
              <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all backdrop-blur-sm">
                <ArrowLeft className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">Change Residency</span>
            </Button>

            {/* Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-sm text-white">
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium">
                Viewing as: <span className="font-bold">{getResidencyDisplay(selectedResidency)}</span>
              </span>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/10 mb-6 shadow-lg">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-200">Curated Experiences</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold font-serif text-white mb-6 drop-shadow-xl">
              Discover
              <span className="text-amber-400"> Kenya</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-lg font-medium">
              Embark on unforgettable adventures across the most spectacular destinations in East Africa.
            </p>
          </div>

          {/* Mobile Status Pill (Visible only on small screens) */}
          <div className="sm:hidden mb-8 flex justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-sm text-white">
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium">
                <span className="font-bold">{getResidencyDisplay(selectedResidency)}</span>
              </span>
            </div>
          </div>

          {/* Filters & Controls */}
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl mb-12">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="relative flex-grow lg:max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none"
                />
              </div>

              {/* Categories */}
              <div className="flex-grow overflow-x-auto no-scrollbar">
                <div className="flex gap-2">
                  {[
                    { id: 'all', name: 'All' },
                    { id: 'Wildlife', name: 'Wildlife' },
                    { id: 'Cultural', name: 'Cultural' },
                    { id: 'Historical', name: 'Historical' },
                    { id: 'Adventure', name: 'Adventure' },
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`
                        whitespace-nowrap px-5 py-3 rounded-xl font-medium transition-all duration-300 border
                        ${selectedCategory === c.id
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-transparent shadow-lg shadow-amber-500/20'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700'}
                      `}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="flex-shrink-0 min-w-[180px]">
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none appearance-none cursor-pointer text-slate-700 dark:text-slate-200 font-medium"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                    <option value="duration">Shortest First</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sorted.map((dest, index) => (
            <Card
              key={dest.id}
              className="group relative bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-3xl"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image Section */}
              <div className="aspect-[4/3] overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
                <img
                  src={dest.updatedAt ? `${dest.image}?v=${new Date(dest.updatedAt).getTime()}` : dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Floating Badges */}
                <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                  <Badge className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-white border-none shadow-sm">
                    {dest.category}
                  </Badge>
                </div>

                {/* Price Tag Overlay */}
                {selectedResidency && (
                  <div className="absolute bottom-4 right-4 z-20">
                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/20">
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">From</div>
                      <div className="text-lg font-bold text-amber-600 dark:text-amber-500">
                        {formatPriceByResidency(getPriceByResidency(dest.pricing, selectedResidency), selectedResidency)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-2xl font-bold font-serif text-slate-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {dest.name}
                  </CardTitle>
                </div>
                <CardDescription className="text-slate-600 dark:text-slate-300 line-clamp-2 text-sm leading-relaxed">
                  {dest.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span className="truncate max-w-[120px]">{dest.location || dest.name}</span>
                  </div>
                  {dest.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>{dest.duration} {dest.duration === 1 ? 'day' : 'days'}</span>
                    </div>
                  )}
                  {dest.maxParticipants && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-500" />
                      <span>Max {dest.maxParticipants}</span>
                    </div>
                  )}
                </div>

                {/* Highlights */}
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-3 text-sm uppercase tracking-wide opacity-80">Highlights</h4>
                  <div className="flex flex-wrap gap-2">
                    {dest.highlights.slice(0, 3).map((h, i) => (
                      <span key={i} className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-xs font-medium text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800/30">
                        {h}
                      </span>
                    ))}
                    {dest.highlights.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400">
                        +{dest.highlights.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link to={`/destinations/${dest.id}?residency=${selectedResidency}`} className="w-full">
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl h-11 shadow-md hover:shadow-lg transition-all">
                      Book Now
                    </Button>
                  </Link>
                  <Link to={`/destinations/${dest.id}?residency=${selectedResidency}`} className="w-full">
                    <Button variant="outline" className="w-full border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl h-11 group/btn">
                      Details <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {sorted.length === 0 && !loading && (
          <div className="text-center py-24 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No destinations found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
              We couldn't find any destinations matching your criteria. Try adjusting your filters.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory('all');
                setSearchTerm('');
              }}
              className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Destinations;