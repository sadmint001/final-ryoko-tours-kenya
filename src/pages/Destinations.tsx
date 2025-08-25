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
}

const Destinations = () => {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recommended');
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedResidency, setSelectedResidency } = useResidency();



  // All destinations and tours combined
  const allDestinations: Destination[] = [
    // Featured Tours from Homepage
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
      rating: 4.9
    },
    {
      id: 2,
      name: "Karen Blixen Museum Tour",
      description: "Step back in time at the home of the 'Out of Africa' author",
      highlights: ["Historical tour", "Cultural experience", "Museum visit"],
      image: "/lovable-uploads/da389b0b-2c48-446a-93d4-03d23e502f85.png",
      pricing: {
        citizenPrice: 800,
        residentPrice: 1200,
        nonResidentPrice: 2500
      },
      category: "Historical",
      duration: 0.5,
      maxParticipants: 15,
      difficulty: "easy",
      rating: 4.7
    },
    {
      id: 3,
      name: "Maasai Cultural Experience",
      description: "Authentic immersion in Maasai traditions and way of life",
      highlights: ["Cultural immersion", "Traditional dance", "Local crafts"],
      image: "/lovable-uploads/0495d7fd-3442-44b2-a254-6666dcde17d0.png",
      pricing: {
        citizenPrice: 1500,
        residentPrice: 2500,
        nonResidentPrice: 5000
      },
      category: "Cultural",
      duration: 1,
      maxParticipants: 12,
      difficulty: "moderate",
      rating: 4.8
    },
    // Top Destinations
    {
      id: 4,
      name: "Mount Kilimanjaro",
      description: "Africa's highest peak offering life-changing adventures and breathtaking views",
      highlights: ["Mountain climbing", "Wildlife viewing", "Cultural experiences"],
      image: "/lovable-uploads/67714bb6-efb7-46fc-9d50-40094c91c610.png",
      pricing: {
        citizenPrice: 45000,
        residentPrice: 65000,
        nonResidentPrice: 120000
      },
      category: "Adventure",
      duration: 7,
      maxParticipants: 12,
      difficulty: "challenging",
      rating: 4.9
    },
    {
      id: 5,
      name: "Great Migration Safari",
      description: "Witness the spectacular wildebeest migration in comfortable safari vehicles",
      highlights: ["Wildlife migration", "Safari drives", "Photography tours"],
      image: "/lovable-uploads/69adab17-1c5d-40e0-af0c-031e44b5af13.png",
      pricing: {
        citizenPrice: 35000,
        residentPrice: 50000,
        nonResidentPrice: 95000
      },
      category: "Wildlife",
      duration: 5,
      maxParticipants: 8,
      difficulty: "moderate",
      rating: 4.8
    },
    {
      id: 6,
      name: "Adventure Activities",
      description: "Thrilling outdoor adventures including zip-lining through pristine forests",
      highlights: ["Zip-lining", "Forest adventures", "Adrenaline activities"],
      image: "/lovable-uploads/8830a94e-8109-4438-99fc-7b8392c0c9c5.png",
      pricing: {
        citizenPrice: 8000,
        residentPrice: 12000,
        nonResidentPrice: 25000
      },
      category: "Adventure",
      duration: 1,
      maxParticipants: 15,
      difficulty: "moderate",
      rating: 4.7
    },
    // Additional Cultural Experiences
    {
      id: 7,
      name: "Bomas of Kenya",
      description: "Experience traditional Kenyan village life and cultural performances",
      highlights: ["Cultural performances", "Traditional villages", "Dance shows"],
      image: "/lovable-uploads/1dd617ea-b3b5-491f-a2f7-ef1c4170e0d6.png",
      pricing: {
        citizenPrice: 1200,
        residentPrice: 1800,
        nonResidentPrice: 3500
      },
      category: "Cultural",
      duration: 0.5,
      maxParticipants: 20,
      difficulty: "easy",
      rating: 4.6
    },
    {
      id: 8,
      name: "Giraffe Centre",
      description: "Get up close with endangered Rothschild giraffes in their natural habitat",
      highlights: ["Giraffe feeding", "Conservation education", "Wildlife photography"],
      image: "/lovable-uploads/7fb62c94-7164-4789-bdf7-04075cd81dc5.png",
      pricing: {
        citizenPrice: 1000,
        residentPrice: 1500,
        nonResidentPrice: 3000
      },
      category: "Wildlife",
      duration: 0.5,
      maxParticipants: 25,
      difficulty: "easy",
      rating: 4.8
    },
    {
      id: 9,
      name: "David Sheldrick Wildlife Trust",
      description: "Visit the world-famous elephant orphanage and learn about conservation",
      highlights: ["Elephant orphanage", "Conservation", "Educational tour"],
      image: "/lovable-uploads/a6a63721-ea3e-40bd-8d4b-4a7b7d495954.png",
      pricing: {
        citizenPrice: 1500,
        residentPrice: 2000,
        nonResidentPrice: 4000
      },
      category: "Wildlife",
      duration: 1,
      maxParticipants: 20,
      difficulty: "easy",
      rating: 4.9
    },
    {
      id: 10,
      name: "Nairobi National Museum",
      description: "Explore Kenya's rich history, culture, and natural heritage",
      highlights: ["Historical exhibits", "Cultural artifacts", "Educational tours"],
      image: "/lovable-uploads/bb7af049-9225-4675-9855-9bc62ac0ea88.png",
      pricing: {
        citizenPrice: 500,
        residentPrice: 800,
        nonResidentPrice: 1500
      },
      category: "Historical",
      duration: 0.5,
      maxParticipants: 30,
      difficulty: "easy",
      rating: 4.5
    },
    {
      id: 11,
      name: "Kazuri Beads Workshop",
      description: "Learn traditional beadwork from local artisans and create your own jewelry",
      highlights: ["Beadwork workshop", "Local artisans", "Handmade crafts"],
      image: "/lovable-uploads/24bcc57e-638a-4459-838a-5f795ba7d56c.png",
      pricing: {
        citizenPrice: 2000,
        residentPrice: 3000,
        nonResidentPrice: 6000
      },
      category: "Cultural",
      duration: 1,
      maxParticipants: 10,
      difficulty: "easy",
      rating: 4.7
    },
    {
      id: 12,
      name: "Lamu Old Town",
      description: "Explore the UNESCO World Heritage site with its rich Swahili culture",
      highlights: ["UNESCO site", "Swahili culture", "Historical architecture"],
      image: "/lovable-uploads/1e8d1015-2f19-4231-b1bf-ac57307e2a83.png",
      pricing: {
        citizenPrice: 25000,
        residentPrice: 35000,
        nonResidentPrice: 75000
      },
      category: "Historical",
      duration: 3,
      maxParticipants: 8,
      difficulty: "moderate",
      rating: 4.8
    }
  ];

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
            Discover Africa
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Embark on unforgettable adventures across the most spectacular destinations in Africa
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
                  src={destination.image} 
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


      </main>
      <Footer />
    </div>
  );
};

export default Destinations;
