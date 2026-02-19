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
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'partners')
          .single();

        if (error) {
          // Silently fall back to hardcoded partners if query fails
          return;
        }

        const parsed: Partner[] = data?.value ? JSON.parse(data.value) : [];
        setPartners(parsed);
      } catch {
        // Silently fall back to hardcoded partners
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
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-amber-500"></div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400">Trusted Collaborations</span>
            <div className="w-8 h-px bg-amber-500"></div>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold font-serif text-slate-800 dark:text-white mb-6">
            Our Trusted
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent"> Partners</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Working together with industry leaders to deliver exceptional experiences and meaningful connections.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 max-w-5xl mx-auto">
          {items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((p, index) => (
            <div
              key={p.id}
              aria-label={p.name}
              className="group"
            >
              <div
                className="
                  relative overflow-hidden rounded-2xl
                  bg-white dark:bg-slate-800
                  border border-slate-200 dark:border-slate-700
                  shadow-md hover:shadow-xl
                  flex items-center justify-center p-6 w-32 h-32 md:w-40 md:h-40
                  transform transition-all duration-500
                  hover:-translate-y-1 hover:scale-[1.05]
                "
              >
                <img
                  src={p.logo}
                  alt={p.alt || p.name}
                  className="h-14 w-14 md:h-16 md:w-16 object-contain transition-all duration-500 rotate-90 drop-shadow-sm group-hover:drop-shadow-md"
                  loading="lazy"
                />

                {/* Name shown on hover */}
                <div className="absolute inset-0 flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter text-center px-2 line-clamp-1">{p.name}</span>
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
