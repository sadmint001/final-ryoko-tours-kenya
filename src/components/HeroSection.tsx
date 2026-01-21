import { Button } from '@/components/ui/button';
import { ChevronRight, Star, Users, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Dynamically import all hero images using Vite's import.meta.glob
const heroImages = Object.values(
  import.meta.glob('@/assets/herobg*.{jpg,png}', { eager: true, import: 'default' })
);

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 15000); // Change image every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image Carousel */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            style={{ backgroundImage: `url(${image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-earth-brown/70 via-earth-brown/50 to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-luxury/20 backdrop-blur-md rounded-full px-8 py-4 mb-8 animate-fade-up border border-sunset-gold/30 shadow-luxury">
            <Star className="h-5 w-5 text-sunset-gold" />
            <span className="font-opensans font-medium text-safari-cream">Tapestry of Experience</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-8xl font-bold font-playfair mb-8 animate-fade-up leading-tight">
            <span className="block text-safari-cream">Experience</span>
            <span className="block bg-gradient-luxury bg-clip-text text-transparent">Africa Beyond Safari</span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl font-opensans mb-10 opacity-95 max-w-4xl mx-auto animate-fade-up leading-relaxed text-safari-cream/90">
            Immerse yourself in curated journeys that blend luxury with authenticity. From intimate wildlife encounters to profound cultural connections — every moment crafted with sophistication.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-fade-up">
            <Link to="/destinations">
              <Button size="lg" className="group bg-gradient-luxury hover:shadow-glow text-earth-brown border-0 px-8 py-4 font-semibold text-lg rounded-xl transition-all duration-300">
                Explore Destinations
                <ChevronRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="bg-safari-cream/10 border-safari-cream/40 text-safari-cream hover:bg-safari-cream/20 px-8 py-4 font-semibold text-lg rounded-xl backdrop-blur-sm transition-all duration-300">
                Build My Itinerary
              </Button>
            </Link>
          </div>

          {/* Luxury Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-3xl mx-auto animate-scale-up">
            <div className="text-center group">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-gradient-luxury/20 backdrop-blur-sm">
                  <Users className="h-6 w-6 text-sunset-gold" />
                </div>
                <span className="text-4xl font-bold font-playfair text-safari-cream">1000+</span>
              </div>
              <p className="font-opensans opacity-90 text-safari-cream/80 font-medium">Happy Travelers</p>
            </div>
            <div className="text-center group">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-gradient-luxury/20 backdrop-blur-sm">
                  <MapPin className="h-6 w-6 text-sunset-gold" />
                </div>
                <span className="text-4xl font-bold font-playfair text-safari-cream">25+</span>
              </div>
              <p className="font-opensans opacity-90 text-safari-cream/80 font-medium">Destinations</p>
            </div>
            <div className="text-center group">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-gradient-luxury/20 backdrop-blur-sm">
                  <Star className="h-6 w-6 text-sunset-gold" />
                </div>
                <span className="text-4xl font-bold font-playfair text-safari-cream">4.9</span>
              </div>
              <p className="font-opensans opacity-90 text-safari-cream/80 font-medium">Average Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
