import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import karunguru from '../assets/karunguru-logo.jpg';
import gaturaGreens from '../assets/gatura-greens-farm-logo.jpg';
import { Handshake, Star } from 'lucide-react';

type Partner = {
  id: string | number;
  name: string;
  logo: string;
  url?: string;
  order?: number;
  alt?: string;
};

const PartnersSection: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    // Fetch partners from site_settings key 'partners' as JSON array for editability
    const fetchPartners = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'partners')
        .single();
      try {
        const parsed: Partner[] = data?.value ? JSON.parse(data.value) : [];
        setPartners(parsed);
      } catch {
        setPartners([]);
      }
    };
    fetchPartners();
  }, []);

  // Use actual partner data if no database entries
  const items = partners.length ? partners : [
    {
      id: 1,
      name: 'Karunguru Gated Community',
      logo: karunguru,
      alt: 'Karunguru Gated Community logo',
      order: 1
    },
    {
      id: 2,
      name: 'Gatura Greens Farm',
      logo: gaturaGreens,
      alt: 'Gatura Greens Farm logo',
      order: 2
    }
  ];

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-amber-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500">
      {/* Decorative Background - Light Mode */}
      <div className="absolute inset-0 overflow-hidden dark:hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-100/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-100/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Decorative Background - Dark Mode */}
      <div className="absolute inset-0 overflow-hidden hidden dark:block pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-500/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-500/20 dark:border-amber-500/30 mb-6">
            <Handshake className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Trusted Collaborations</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold font-serif text-slate-800 dark:text-white mb-6">
            Our Trusted
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent"> Partners</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Working together with industry leaders to deliver exceptional experiences and meaningful connections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center justify-items-center max-w-4xl mx-auto">
          {items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((p, index) => (
            <div
              key={p.id}
              aria-label={p.name}
              className="w-full group"
            >
              <div
                className="
                  relative overflow-hidden rounded-3xl
                  bg-white dark:bg-slate-800
                  border border-slate-200 dark:border-slate-700
                  shadow-lg hover:shadow-2xl
                  flex items-center justify-center p-8 h-64
                  transform transition-all duration-500
                  hover:-translate-y-2 hover:scale-[1.02]
                "
              >
                {/* Floating particle effect on hover */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <img
                  src={p.logo}
                  alt={p.alt || p.name}
                  className="max-h-40 w-auto object-contain transition-all duration-500 filter grayscale group-hover:grayscale-0 group-hover:scale-110 drop-shadow-sm group-hover:drop-shadow-lg"
                  loading="lazy"
                />

                {/* Name shown on hover for accessibility/clarity */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-slate-800 dark:via-slate-800/90 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{p.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
