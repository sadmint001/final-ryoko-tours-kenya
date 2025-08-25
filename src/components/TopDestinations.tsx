import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import ResidencySelector from '@/components/ResidencySelector';
import { getPriceByResidency, formatPrice } from '@/lib/pricing';
import { useResidency } from '@/contexts/ResidencyContext';

const TopDestinations = () => {
  const { selectedResidency, setSelectedResidency } = useResidency();

  const destinations = [
    {
      id: 1,
      name: "Mount Kilimanjaro",
      description: "Africa's highest peak offering life-changing adventures and breathtaking views",
      highlights: ["Mountain climbing", "Wildlife viewing", "Cultural experiences"],
      image: "/lovable-uploads/67714bb6-efb7-46fc-9d50-40094c91c610.png",
      pricing: {
        citizenPrice: 45000,
        residentPrice: 65000,
        nonResidentPrice: 120000
      }
    },
    {
      id: 2,
      name: "Nairobi National Park",
      description: "Unique wildlife park where city skyline meets African savanna",
      highlights: ["Urban safari", "Zebra herds", "Wildlife photography"],
      image: "/lovable-uploads/73327ee8-9c0a-46bc-bb2d-790af95674a4.png",
      pricing: {
        citizenPrice: 2500,
        residentPrice: 3500,
        nonResidentPrice: 8500
      }
    },
    {
      id: 3,
      name: "Great Migration",
      description: "Witness the spectacular wildebeest migration in comfortable safari vehicles",
      highlights: ["Wildlife migration", "Safari drives", "Photography tours"],
      image: "/lovable-uploads/69adab17-1c5d-40e0-af0c-031e44b5af13.png",
      pricing: {
        citizenPrice: 35000,
        residentPrice: 50000,
        nonResidentPrice: 95000
      }
    },
    {
      id: 4,
      name: "Adventure Activities",
      description: "Thrilling outdoor adventures including zip-lining through pristine forests",
      highlights: ["Zip-lining", "Forest adventures", "Adrenaline activities"],
      image: "/lovable-uploads/8830a94e-8109-4438-99fc-7b8392c0c9c5.png",
      pricing: {
        citizenPrice: 8000,
        residentPrice: 12000,
        nonResidentPrice: 25000
      }
    }
  ];

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
                style={{ backgroundImage: `url(${destination.image})` }}
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