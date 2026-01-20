import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Award, Heart, ShieldCheck, Users, CheckCircle2 } from 'lucide-react';

// Using the same local assets
import whyUs1 from '@/assets/whyus1.jpg';
import whyUs2 from '@/assets/whyus2.jpg';
import whyUs3 from '@/assets/whyus3.jpg';
import whyUs4 from '@/assets/whyus4.jpg';

type Pillar = {
  id: string;
  title: string;
  body: string;
  detail?: string;
  bullets?: string[];
  image: string;
  icon: React.ReactNode;
  accentColor: string;
  gradient: string;
};

const pillars: Pillar[] = [
  {
    id: 'exceptional-service',
    title: 'Exceptional Service',
    body: "From your first inquiry to the final farewell, we treat every moment with care. Our support team is responsive, friendly, and committed to ensuring your experience is seamless — because travel should feel personal, not procedural.",
    detail: "Whether it’s customizing your safari, arranging last-minute changes, or simply checking in on your comfort, Ryoko Tours Africa is with you all the way. We believe real service comes from genuine connection.",
    bullets: [
      "24/7 dedicated customer support before and during your trip",
      "Professional, warm, and responsive travel assistance",
      "Personalized itineraries tailored to your pace and preference"
    ],
    image: whyUs1,
    icon: <Award className="w-8 h-8" />,
    accentColor: "amber",
    gradient: "from-amber-500 to-orange-600"
  },
  {
    id: 'unforgettable-experiences',
    title: 'Unforgettable Experiences',
    body: "Every Ryoko journey is more than a tour — it’s an immersion into Kenya’s beauty, culture, and heartbeat. From the golden plains of the Maasai Mara to the whispering coasts of Diani, our experiences are designed to move your soul.",
    detail: "We work with local guides, artisans, and communities to make every trip a genuine encounter — not just a stop on the map, but a story worth living.",
    bullets: [
      "Authentic interactions with local cultures and traditions",
      "Handpicked destinations that balance adventure and relaxation",
      "Custom routes showcasing Kenya’s hidden gems and natural wonders"
    ],
    image: whyUs2,
    icon: <Heart className="w-8 h-8" />,
    accentColor: "rose",
    gradient: "from-rose-500 to-pink-600"
  },
  {
    id: 'safety-first',
    title: 'Safety First — Always',
    body: "Your peace of mind is our top priority. We go above and beyond to ensure every journey is secure, smooth, and supported — so you can focus on the beauty around you, not the logistics.",
    detail: "Our guides are fully trained, our vehicles inspected before every trip, and our partners carefully vetted for reliability. You travel with confidence, knowing Ryoko Tours Africa has your back.",
    bullets: [
      "Fully insured vehicles and certified guides",
      "24-hour emergency assistance and real-time tracking",
      "Verified partners and secure online booking systems"
    ],
    image: whyUs3,
    icon: <ShieldCheck className="w-8 h-8" />,
    accentColor: "emerald",
    gradient: "from-emerald-500 to-teal-600"
  },
  {
    id: 'stories-worth-telling',
    title: 'Stories Worth Telling',
    body: "We believe travel should leave you with more than photos — it should give you a story. With Ryoko Tours Africa, every trip becomes a personal narrative of wonder, connection, and meaning.",
    detail: "Whether it's the laughter shared with your guide, a sunset over the savannah, or a child's smile in a village — these are the stories that stay long after you return home.",
    bullets: [
      "Create lifelong memories through authentic experiences",
      "Share moments that spark inspiration and belonging",
      "Return home with a heart full of stories, not just souvenirs"
    ],
    image: whyUs4,
    icon: <Users className="w-8 h-8" />,
    accentColor: "blue",
    gradient: "from-blue-500 to-indigo-600"
  }
];

const WhyUs: React.FC = () => {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const el = document.getElementById(hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, []);

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        {/* Decorative Background - Light */}
        <div className="absolute inset-0 overflow-hidden dark:hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-amber-100/40 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-100/30 to-transparent rounded-full blur-3xl"></div>
        </div>
        {/* Decorative Background - Dark */}
        <div className="absolute inset-0 overflow-hidden hidden dark:block pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold font-serif text-slate-800 dark:text-white mb-8 leading-tight">
              Why Choose
              <span className="block mt-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                Ryoko Tours Africa?
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
              Because we don't just take you places — we take you personally. Our purpose is to redefine travel through service, authenticity, and safety.
            </p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 pb-24 space-y-32">
        {pillars.map((pillar, index) => (
          <section
            key={pillar.id}
            id={pillar.id}
            className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
          >
            {/* Image Side */}
            <div className="w-full lg:w-1/2 relative group">
              <div
                className={`
                  absolute -inset-4 rounded-[2.5rem] rotate-2 opacity-70 blur-xl transition-all duration-500 group-hover:rotate-0 group-hover:scale-105
                  bg-gradient-to-br ${pillar.gradient}
                `}
              ></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] transform transition-transform duration-500 group-hover:-translate-y-2">
                <img
                  src={pillar.image}
                  alt={pillar.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Glass overlay on image bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <div className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-full 
                    bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium
                    transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500
                  `}>
                    <span className="text-2xl">{pillar.icon}</span>
                    <span>{pillar.title}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Side */}
            <div className="w-full lg:w-1/2">
              <div className={`
                inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-8 shadow-lg
                bg-gradient-to-br ${pillar.gradient} text-white
                transform transition-all duration-500 hover:scale-110 hover:rotate-3
              `}>
                {pillar.icon}
              </div>

              <h2 className="text-3xl md:text-4xl font-bold font-serif text-slate-800 dark:text-white mb-6">
                {pillar.title}
              </h2>

              <div className="space-y-6 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  {pillar.body}
                </p>
                {pillar.detail && (
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    {pillar.detail}
                  </p>
                )}
              </div>

              {pillar.bullets && (
                <div className="mt-8 space-y-4">
                  {pillar.bullets.map((bullet, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 group/item p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <CheckCircle2 className={`w-6 h-6 flex-shrink-0 mt-0.5 text-${pillar.accentColor}-500 dark:text-${pillar.accentColor}-400 group-hover/item:scale-110 transition-transform`} />
                      <span className="text-slate-700 dark:text-slate-300">{bullet}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}
      </main>

      <Footer />
    </div>
  );
};

export default WhyUs;