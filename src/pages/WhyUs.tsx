import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type Pillar = {
  id: string;
  title: string;
  body: string;
  detail?: string;
  bullets?: string[];
  icon?: string; // TODO:CLIENT_ASSET optional icon url
};

const pillars: Pillar[] = [
  {
    id: 'exceptional-service',
    title: 'Exceptional Service',
    body: '{{WHY_US_exceptional-service}}',
    detail: '{{WHY_US_exceptional-service_detail}}',
    bullets: [
      '{{WHY_US_exceptional-service_point_1}}',
      '{{WHY_US_exceptional-service_point_2}}',
      '{{WHY_US_exceptional-service_point_3}}'
    ]
  },
  {
    id: 'unforgettable-experiences',
    title: 'Unforgettable Experiences',
    body: '{{WHY_US_unforgettable-experiences}}',
    detail: '{{WHY_US_unforgettable-experiences_detail}}',
    bullets: [
      '{{WHY_US_unforgettable-experiences_point_1}}',
      '{{WHY_US_unforgettable-experiences_point_2}}',
      '{{WHY_US_unforgettable-experiences_point_3}}'
    ]
  },
  {
    id: 'safety-first',
    title: 'Safety First',
    body: '{{WHY_US_safety-first}}',
    detail: '{{WHY_US_safety-first_detail}}',
    bullets: [
      '{{WHY_US_safety-first_point_1}}',
      '{{WHY_US_safety-first_point_2}}',
      '{{WHY_US_safety-first_point_3}}'
    ]
  },
  {
    id: 'stories-worth-telling',
    title: 'Stories Worth Telling',
    body: '{{WHY_US_stories-worth-telling}}',
    detail: '{{WHY_US_stories-worth-telling_detail}}',
    bullets: [
      '{{WHY_US_stories-worth-telling_point_1}}',
      '{{WHY_US_stories-worth-telling_point_2}}',
      '{{WHY_US_stories-worth-telling_point_3}}'
    ]
  }
];

const WhyUs = () => {
  const stepColors = [
    'from-fuchsia-500 to-purple-500',
    'from-indigo-500 to-blue-500',
    'from-sky-500 to-cyan-500',
    'from-amber-500 to-orange-500',
  ];

  const location = useLocation();

  // On mount / location change, if there's a hash, scroll to matching pillar
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        // small timeout to ensure element is rendered
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
        // optional: briefly highlight the target
        el.classList.add('ring-2', 'ring-orange-400', 'rounded-xl');
        setTimeout(() => el.classList.remove('ring-2', 'ring-orange-400', 'rounded-xl'), 2000);
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        <div className="container mx-auto px-4 pb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-playfair text-primary mb-6">Why Us</h1>
          {/* Intro/overview block */}
          <p className="text-lg text-muted-foreground leading-relaxed mb-10 whitespace-pre-line">
            {'{{WHY_US_overview}}'}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* Left circular summary */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-56 h-56 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shadow-[inset_0_0_30px_rgba(0,0,0,0.15)]">
                <div className="absolute inset-3 rounded-full border-2 border-primary/20" />
                <div className="absolute inset-6 rounded-full border-2 border-primary/10" />
                <div className="text-center">
                  <div className="text-6xl font-bold font-playfair text-primary leading-none">{pillars.length}</div>
                  <div className="mt-2 text-sm uppercase tracking-wide text-muted-foreground">Reasons</div>
                </div>
              </div>
            </div>

            {/* Right stepped content */}
            <div className="lg:col-span-2">
              <ol className="relative space-y-8">
                <span className="hidden lg:block absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-border to-transparent" />
                {pillars.map((pillar, index) => (
                  <li key={pillar.id} className="relative" id={pillar.id}>
                    <div className="flex items-start gap-4">
                      <div className={`shrink-0 rounded-xl bg-gradient-to-r ${stepColors[index % stepColors.length]} text-white px-3 py-2 shadow-md`}>
                        <div className="text-[10px] uppercase opacity-80 leading-none">Step</div>
                        <div className="text-lg font-bold leading-none">{String(index + 1).padStart(2,'0')}</div>
                      </div>
                      <div className="flex-1 rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-5 shadow-sm">
                        <h2 className="text-xl md:text-2xl font-bold font-playfair text-foreground mb-2">{pillar.title}</h2>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line mb-4">{pillar.body}</p>
                        {pillar.detail && (
                          <p className="text-foreground/90 leading-relaxed whitespace-pre-line mb-4">{pillar.detail}</p>
                        )}
                        {pillar.bullets && (
                          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                            {pillar.bullets.map((b, i) => (
                              <li key={i} className="whitespace-pre-line">{b}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WhyUs;


