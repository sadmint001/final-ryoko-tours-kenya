import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ✅ Importing local assets
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
    image: whyUs1
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
    image: whyUs2
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
    image: whyUs3
  },
  {
    id: 'stories-worth-telling',
    title: 'Stories Worth Telling',
    body: "We believe travel should leave you with more than photos — it should give you a story. With Ryoko Tours Africa, every trip becomes a personal narrative of wonder, connection, and meaning.",
    detail: "Whether it’s the laughter shared with your guide, a sunset over the savannah, or a child’s smile in a village — these are the stories that stay long after you return home.",
    bullets: [
      "Create lifelong memories through authentic experiences",
      "Share moments that spark inspiration and belonging",
      "Return home with a heart full of stories, not just souvenirs"
    ],
    image: whyUs4
  }
];

const WhyUs: React.FC = () => {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const el = document.getElementById(hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
  }, []);

  // step badge colors used when rendering the steps/cards
  const stepColors = [
    '#9f7aea', // purple-400
    '#fb923c', // orange-400
    '#34d399', // emerald-400
    '#f59e0b'  // amber-400
  ];

  return (
    <div>
      <Navbar />
      <main className="pt-24">
        <div className="container mx-auto px-4 pb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-playfair text-primary mb-6 text-center">
            Why Choose Ryoko Tours Africa ?
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10 text-center max-w-3xl mx-auto">
            Because we don’t just take you places — we take you personally. Our purpose is to redefine travel through service, authenticity, and safety, crafting journeys that connect you with the heart of Africa.
          </p>

          {/* Pillars Section with Parallax */}
          <div className="space-y-20">
            {pillars.map((pillar, index) => (
              <section
                key={pillar.id}
                id={pillar.id}
                className="relative rounded-3xl overflow-hidden shadow-xl"
              >
                {/* Parallax Background */}
                <div
                  className="absolute inset-0 bg-center bg-cover bg-fixed"
                  style={{
                    backgroundImage: `url(${pillar.image})`,
                    backgroundAttachment: 'fixed',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(60%)',
                  }}
                />

                {/* Overlay Content */}
                <div className="relative z-10 p-10 md:p-16 text-white bg-black/40 backdrop-blur-sm">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`rounded-xl bg-gradient-to-r ${stepColors[index % stepColors.length]} px-3 py-2 shadow-lg`}>
                        <div className="text-[10px] uppercase opacity-90 leading-none text-white">Step</div>
                        <div className="text-lg font-bold leading-none text-white">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold font-playfair">{pillar.title}</h2>
                    </div>

                    <p className="text-lg leading-relaxed mb-4 text-gray-100">{pillar.body}</p>
                    {pillar.detail && (
                      <p className="text-md leading-relaxed mb-6 text-gray-200">{pillar.detail}</p>
                    )}
                    {pillar.bullets && (
                      <ul className="list-disc pl-6 space-y-2 text-gray-200">
                        {pillar.bullets.map((b, i) => (
                          <li key={i} className="leading-relaxed">{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WhyUs;
