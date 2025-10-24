import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';
import karunguru from '../assets/karunguru-logo.jpg';
import gaturaGreens from '../assets/gatura-greens-farm-logo.jpg';

type Partner = {
  id: string | number;
  name: string;
  logo: string;
  url?: string;
  order?: number;
  alt?: string;
};

const Partners: React.FC = () => {
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
      url: 'https://karunguru.com',
      alt: 'Karunguru Gated Community logo',
      order: 1 
    },
    { 
      id: 2, 
      name: 'Gatura Greens Farm', 
      logo: gaturaGreens, 
      url: 'https://gaturagreens.com',
      alt: 'Gatura Greens Farm logo',
      order: 2 
    }
  ];

  return (
    <section className="py-16 bg-transparent">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-semibold text-center text-white mb-12">
          Our Trusted Partners
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center justify-items-center max-w-4xl mx-auto">
          {items.sort((a,b)=>(a.order??0)-(b.order??0)).map((p) => (
            <a 
              key={p.id} 
              href={p.url || '#'} 
              target={p.url?"_blank":"_self"} 
              rel="noopener noreferrer" 
              aria-label={p.name}
              className="w-full"
            >
              <Card className="p-8 flex items-center justify-center h-48 hover:scale-105 transition-transform duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                <img 
                  src={p.logo} 
                  alt={p.alt || p.name} 
                  className="max-h-32 w-auto object-contain rotate-90 transform hover:brightness-110 transition-all"
                  loading="lazy" 
                />
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;


