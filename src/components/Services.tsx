import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, Sparkles, Percent, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Services = () => {
  const [discountDests, setDiscountDests] = useState<{ id: number; name: string; percentage: number; threshold: number; }[]>([]);

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
  const promo = isSingleDiscount ? discountDests[0] : (hasDiscounts ? discountDests[0] : null);
  const promoLink = isSingleDiscount ? `/destinations/${discountDests[0].id}` : '/destinations?group_deals=true';

  const features = [
    'Automatic group discounts applied at checkout',
    'Dedicated trip coordinator for your group',
    'Customizable itineraries for any group size',
    'Private safari vehicles & exclusive experiences',
    'Flexible payment plans for large parties',
    'Special rates for corporate & school groups',
  ];

  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.06),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(245,158,11,0.04),transparent_60%)]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-px bg-amber-500/50" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400/70">Exclusive Offer</span>
            <div className="w-12 h-px bg-amber-500/50" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white mb-5">
            Group <span className="text-amber-400">Deals</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
            {hasDiscounts && promo ? `Travel together, save together. Unlock exclusive group discounts ${isSingleDiscount ? `on ${promo.name}` : 'on select destinations'} when you book for ${promo.threshold} or more guests.` : 'Travel together and experience the wild heart of Kenya as a group. Exclusive group itineraries and dedicated coordinators available.'}
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/5">

            {/* Image Side */}
            <div className="relative h-72 lg:h-auto lg:min-h-[480px] overflow-hidden">
              <img
                src="/images/safari/sunset_safari.jpg"
                alt="Group Safari Experience"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 hidden lg:block" />

              {/* Floating discount badge */}
              {hasDiscounts && promo && (
                <div className="absolute top-6 left-6">
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl px-5 py-3 shadow-xl shadow-amber-500/30 flex items-center gap-3">
                    <Percent className="w-6 h-6 text-slate-900" />
                    <div>
                      <p className="text-2xl font-black text-slate-900 leading-none">{isSingleDiscount ? promo.percentage : Math.max(...discountDests.map(d => d.percentage))}% OFF</p>
                      <p className="text-[10px] font-bold text-slate-900/70 uppercase tracking-wider">Group Savings</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom overlay text */}
              <div className="absolute bottom-6 left-6 right-6">
                {hasDiscounts && promo && (
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                      {promo.threshold}+ Guests Required
                    </span>
                  </div>
                )}
                <p className="text-white/70 text-sm leading-relaxed">
                  Bring your friends, family, or team and experience the wild heart of Kenya together.
                </p>
              </div>
            </div>

            {/* Content Side */}
            <div className="bg-slate-900 p-8 lg:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-serif text-white">Group Safari Deals</h3>
                  </div>
                </div>

                <p className="text-white/50 mb-8 leading-relaxed">
                  {hasDiscounts && promo ? (
                    <>
                      Book for <span className="text-amber-400 font-semibold">{promo.threshold} or more guests</span> {isSingleDiscount ? `on ${promo.name}` : 'on select destinations'} and automatically receive a <span className="text-amber-400 font-semibold">{promo.percentage}% discount</span> on your entire booking — no promo codes needed.
                    </>
                  ) : (
                    <>
                      Book as a group and get access to exclusive private safari vehicles, dedicated group coordinators, and tailored itineraries for your entire party.
                    </>
                  )}
                </p>

                {/* Features Grid */}
                <div className="space-y-3 mb-8">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-emerald-500/20 transition-colors">
                        <Check className="w-3 h-3 text-emerald-400" />
                      </div>
                      <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to={promoLink} className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-900 font-bold h-13 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-300 hover:-translate-y-0.5 text-sm group">
                    Explore Destinations
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/contact" className="flex-1">
                  <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 hover:border-amber-500/30 font-semibold h-13 rounded-xl transition-all duration-300 text-sm">
                    Get Quote
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;