import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';
import karunguru from '../assets/karunguru-logo.png';
import gaturaGreens from '../assets/gatura-greens-farm-logo.png';

type Partner = {
  id: string;
  name: string;
  logo: string; // TODO:CLIENT_ASSET
  url?: string;
  order?: number;
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

  const items = partners.length ? partners : [
    { id: 'p1', name: 'Partner One', logo: '/lovable-uploads/placeholder1.png', url: '#', order: 1 }, // TODO:CLIENT_ASSET
    { id: 'p2', name: 'Partner Two', logo: '/lovable-uploads/placeholder2.png', url: '#', order: 2 }  // TODO:CLIENT_ASSET
  ];

  const defaultPartners = [
    { id: 1, name: 'Karunguru Gated Community', logo: karunguru, alt: 'Karunguru Gated Community logo' },
    { id: 2, name: 'Gatura Greens Farm', logo: gaturaGreens, alt: 'Gatura Greens Farm logo' },
  ];

  return (
    <section className="py-16 bg-transparent">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-semibold text-center text-white mb-8">
          Our Trusted Partners
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
          {items.sort((a,b)=>(a.order??0)-(b.order??0)).map((p) => (
            <a key={p.id} href={p.url || '#'} target={p.url?"_blank":"_self"} rel="noopener noreferrer" aria-label={p.name}>
              <Card className="p-4 flex items-center justify-center h-24">
                <img src={p.logo} alt={p.name} className="max-h-16 object-contain" loading="lazy" />
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;


