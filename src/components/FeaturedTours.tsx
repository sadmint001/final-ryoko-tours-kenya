import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import ResidencySelector from '@/components/ResidencySelector';
import { getPriceByResidency, formatPrice } from '@/lib/pricing';
import { useResidency } from '@/contexts/ResidencyContext';

const FeaturedTours = () => {
  const { selectedResidency, setSelectedResidency } = useResidency();



  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'challenging': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get pricing for a tour
  const getTourPricing = (tour) => {
    return {
      citizenPrice: tour.citizenPrice,
      residentPrice: tour.residentPrice,
      nonResidentPrice: tour.nonResidentPrice
    };
  };

  return (
    <section className="py-20 bg-gradient-earth">
      <div className="container mx-auto px-4">
        {/* Residency Selection */}
        <ResidencySelector 
          selectedResidency={selectedResidency}
          onResidencyChange={setSelectedResidency}
        />

        {/* Section Header - Updated text */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-playfair text-primary mb-4">
            Experience Africa Beyond the Safaris
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore Kenya through our carefully curated experiences that go beyond traditional tourism
          </p>
        </div>

        
        {/* CTA */}
        <div className="text-center">
          <Link to="/destinations">
            <Button size="lg" className="bg-gradient-safari hover:opacity-90 text-white">
              View All Experiences
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTours;