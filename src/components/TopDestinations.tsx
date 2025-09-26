import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import ResidencySelector from '@/components/ResidencySelector';
import { getPriceByResidency, formatPrice } from '@/lib/pricing';
import { useResidency } from '@/contexts/ResidencyContext';
import { supabase } from '@/integrations/supabase/client';

type Destination = {
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
  updatedAt?: string;
};

const TopDestinations = () => {
  const { selectedResidency, setSelectedResidency } = useResidency();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const sb: any = supabase;
        const { data, error } = await sb
          .from('destinations')
          .select('*')
          .eq('is_active', true)
          .eq('is_featured', true)
          .order('featured_order', { ascending: true })
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
          updatedAt: d.updated_at ?? undefined,
        }));
        setDestinations(mapped);
      } catch (e) {
        console.error('Failed to load featured destinations:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-playfair text-primary mb-4">
            Top Destinations
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore the diverse landscapes and rich culture of Kenya
          </p>
        </div>

        {/* Residency Selection */}
        <ResidencySelector 
          selectedResidency={selectedResidency}
          onResidencyChange={setSelectedResidency}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {destinations.map((destination) => (
            <Card key={destination.id} className="group hover:shadow-elevated transition-all duration-300 overflow-hidden">
              <div 
                className="aspect-video bg-cover bg-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300"
                style={{ backgroundImage: `url(${destination.updatedAt ? `${destination.image}?v=${new Date(destination.updatedAt).getTime()}` : destination.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold font-playfair text-primary mb-3 group-hover:text-primary/80 transition-colors">
                  {destination.name}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {destination.description}
                </p>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-foreground mb-2">Highlights:</h4>
                  <div className="flex flex-wrap gap-2">
                    {destination.highlights.map((highlight, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="mb-6">
                  <div className="text-center w-full bg-slate-50 p-3 rounded-lg border-2 border-dashed border-gray-300">
                    {selectedResidency ? (
                      <>
                        <div className="text-sm text-black dark:text-black font-medium">Starting from</div>
                        <div className="text-2xl font-bold text-primary">
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
                </div>

                <Link to="/destinations">
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Explore Tours
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/destinations">
            <Button size="lg" className="bg-gradient-safari hover:opacity-90 text-white">
              View All Destinations
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TopDestinations;