import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/ui/loader';
import ResidencySelector from '@/components/ResidencySelector';
import { getPriceByResidency, formatPrice } from '@/lib/pricing';
import { useResidency } from '@/contexts/ResidencyContext';

interface Tour {
  id: string;
  title: string;
  description: string;
  short_description: string;
  price: number;
  citizen_price?: number;
  resident_price?: number;
  non_resident_price?: number;
  duration_days: number;
  max_participants: number;
  location: string;
  difficulty_level: string;
  includes: string[];
  image_url?: string;
}

const Tours = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedResidency, setSelectedResidency } = useResidency();

  // Fallback images for tours without image_url
  const fallbackImages = [
    "/lovable-uploads/8830a94e-8109-4438-99fc-7b8392c0c9c5.png",
    "/lovable-uploads/73327ee8-9c0a-46bc-bb2d-790af95674a4.png",
    "/lovable-uploads/0495d7fd-3442-44b2-a254-6666dcde17d0.png",
    "/lovable-uploads/69adab17-1c5d-40e0-af0c-031e44b5af13.png",
    "/lovable-uploads/da389b0b-2c48-446a-93d4-03d23e502f85.png",
    "/lovable-uploads/67714bb6-efb7-46fc-9d50-40094c91c610.png",
  ];

  useEffect(() => {
    const fetchTours = async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tours:', error);
      } else {
        setTours(data || []);
      }
      setLoading(false);
    };

    fetchTours();
  }, []);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'challenging': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get pricing for a tour based on residency
  const getTourPricing = (tour: Tour) => {
    // If tour has specific residency pricing, use it
    if (tour.citizen_price && tour.resident_price && tour.non_resident_price) {
      return {
        citizenPrice: tour.citizen_price,
        residentPrice: tour.resident_price,
        nonResidentPrice: tour.non_resident_price
      };
    }
    
    // Fallback to base price for all categories
    return {
      citizenPrice: tour.price * 0.7, // 30% discount for citizens
      residentPrice: tour.price * 0.85, // 15% discount for residents
      nonResidentPrice: tour.price
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader label="Preparing your adventures..." />
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour, index) => (
            <Card key={tour.id} className="group hover:shadow-elegant transition-all duration-300 overflow-hidden">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={tour.image_url || fallbackImages[index % fallbackImages.length]} 
                  alt={tour.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-display group-hover:text-primary transition-colors">
                    {tour.title}
                  </CardTitle>
                  <Badge className={getDifficultyColor(tour.difficulty_level)}>
                    {tour.difficulty_level}
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {tour.short_description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {tour.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {tour.duration_days} days
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Max {tour.max_participants}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-center w-full bg-slate-50 p-3 rounded-lg border-2 border-dashed border-gray-300">
                    {selectedResidency ? (
                      <>
                        <div className="text-sm text-black dark:text-black font-medium">Price</div>
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(getPriceByResidency(getTourPricing(tour), selectedResidency))}
                          <span className="text-sm font-normal text-black dark:text-black ml-1">
                            per person
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-black dark:text-black font-medium">Price</div>
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
                </div>
                
                <div className="flex justify-center">
                  <Link to={`/booking?tour=${tour.id}`}>
                    <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 transition-all text-black font-medium">
                      Book Now
                    </Button>
                  </Link>
                </div>

                {tour.includes && tour.includes.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Includes:</p>
                    <div className="flex flex-wrap gap-1">
                      {tour.includes.slice(0, 3).map((item, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                      {tour.includes.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{tour.includes.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {tours.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No tours available at the moment.</p>
            <p className="text-muted-foreground mt-2">Check back soon for amazing adventures!</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Tours;