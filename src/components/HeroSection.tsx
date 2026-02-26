import { Button } from '@/components/ui/button';
import { ChevronRight, Sparkles, Percent, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Dynamically import all hero images using Vite's import.meta.glob
const heroImages = Object.values(
  import.meta.glob('@/assets/herobg*.{jpg,png}', { eager: true, import: 'default' })
);

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [discountDests, setDiscountDests] = useState<{ id: number; name: string; percentage: number; threshold: number; }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 15000); // Change image every 15 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchDiscountDests = async () => {
      try {
        const { data } = await supabase
          .from('destinations')
          .select('id, name, discount_percentage, discount_threshold')
          .eq('is_active', true)
          .eq('has_group_discount', true);

        if (data && data.length > 0) {
          setDiscountDests(data.map((d: any) => ({
            id: d.id,
            name: d.name,
            percentage: d.discount_percentage || 0,
            threshold: d.discount_threshold || 1
          })));
        }
      } catch (e) {
        console.error('Failed to load discount destinations', e);
      }
    };
    fetchDiscountDests();
  }, []);

  const hasDiscounts = discountDests.length > 0;
  const isSingleDiscount = discountDests.length === 1;
  const promo = isSingleDiscount ? discountDests[0] : (hasDiscounts ? discountDests[0] : null); // Fallback to first if multiple
  const promoLink = isSingleDiscount ? `/destinations/${discountDests[0].id}` : '/destinations?group_deals=true';

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image Carousel */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ${index === currentImageIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              }`}
            style={{
              backgroundImage: `url(${image})`,
              willChange: 'transform, opacity'
            }}
          >
            <img
              src={image as string}
              className="hidden"
              alt=""
              loading={index === 0 ? "eager" : "lazy"}
              // @ts-ignore - fetchpriority is a valid experimental attribute
              fetchpriority={index === 0 ? "high" : "low"}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-earth-brown/70 via-earth-brown/50 to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Premium Badge */}
          <div className="flex items-center justify-center gap-3 mb-8 animate-fade-up">
            <div className="w-8 h-px bg-sunset-gold"></div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-sunset-gold">Tapestry of Experience</span>
            <div className="w-8 h-px bg-sunset-gold"></div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold font-playfair mb-6 md:mb-8 animate-fade-up leading-tight px-2">
            <span className="block text-safari-cream">Experience</span>
            <span className="block bg-gradient-luxury bg-clip-text text-transparent">Africa Beyond Safari</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-2xl font-opensans mb-8 md:mb-10 opacity-95 max-w-4xl mx-auto animate-fade-up leading-relaxed text-safari-cream/90 px-4">
            Immerse yourself in curated journeys that blend luxury with authenticity. Every moment crafted with care.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 md:mb-16 animate-fade-up px-4 w-full max-w-md mx-auto sm:max-w-none">
            <Link to="/destinations" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto group bg-gradient-luxury hover:shadow-glow text-earth-brown border-0 px-8 py-4 font-semibold text-base sm:text-lg rounded-xl transition-all duration-300">
                Explore Destinations
                <ChevronRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/contact" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-safari-cream/10 border-safari-cream/40 text-safari-cream hover:bg-safari-cream/20 px-8 py-4 font-semibold text-base sm:text-lg rounded-xl backdrop-blur-sm transition-all duration-300">
                Build My Itinerary
              </Button>
            </Link>
          </div>

          {/* Promotional Discount Banner */}
          {hasDiscounts && promo && (
            <div className="max-w-3xl mx-auto animate-scale-up">
              <div className="relative overflow-hidden rounded-2xl border border-white/10">
                {/* Layered Background */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10" />
                <div className="absolute inset-0 ring-1 ring-inset ring-amber-400/20 rounded-2xl" />

                <div className="relative px-6 py-5 md:px-8 md:py-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  {/* Icon */}
                  <div className="flex-shrink-0 relative group">
                    <div className="bg-red-600 rounded-xl px-4 py-2 sm:px-5 sm:py-3 flex items-center justify-center gap-2 sm:gap-3 shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform duration-300">
                      <Percent className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[2.5]" />
                      <div className="flex flex-col items-start justify-center">
                        <span className="text-xl sm:text-2xl font-black leading-none tracking-tight text-white whitespace-nowrap">
                          {isSingleDiscount ? `${promo.percentage}% OFF` : `Up to ${Math.max(...discountDests.map(d => d.percentage))}% OFF`}
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold tracking-[0.15em] text-white/90 mt-[1px] sm:mt-0.5 uppercase whitespace-nowrap">
                          Group Savings
                        </span>
                      </div>
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-md animate-bounce" style={{ animationDuration: '2s' }}>
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  {/* Copy */}
                  <div className="flex-grow text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400/80">
                        {isSingleDiscount ? 'Exclusive Destination Deal' : 'Multiple Group Offers'}
                      </span>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-base md:text-lg font-serif font-bold text-white leading-snug">
                      {isSingleDiscount ? (
                        <>Book for <span className="text-amber-400">{promo.threshold}+</span> guests & save <span className="text-amber-400">{promo.percentage}%</span> instantly on <span className="text-emerald-400">{promo.name}</span></>
                      ) : (
                        <>Book for <span className="text-amber-400">{promo.threshold}+</span> guests & save instantly on select destinations like <span className="text-emerald-400">{promo.name}</span></>
                      )}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="flex-shrink-0">
                    <Link to={promoLink}>
                      <Button className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-900 font-bold px-6 py-3 h-auto rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-300 hover:-translate-y-0.5 text-sm group">
                        {isSingleDiscount ? 'View Deal' : 'View Deals'}
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
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
