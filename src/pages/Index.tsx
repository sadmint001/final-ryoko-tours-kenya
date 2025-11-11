import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import BlogSection from '@/components/BlogSection';
import Footer from '@/components/Footer';
import Partners from '@/components/Partners';
import { Award, Heart, ShieldCheck, Users, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  // Redirect cards to the dedicated Why Us page with a hash for the section
  const handleSelect = (key: string) => {
    navigate(`/whyus#${key}`);
  };

  const testimonials = [
    { id: 't1', quote: 'More than a tour — it was a connection.', author: 'Sarah M.', location: 'Canada', rating: 5 },
    { id: 't2', quote: 'Professional, flexible, and unforgettable.', author: 'Brian K.', location: 'Nairobi', rating: 5 },
    { id: 't3', quote: 'A seamless blend of adventure and insight.', author: 'Alina R.', location: 'Germany', rating: 5 },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />

      {/* Featured Tours (elegant hover + click -> /destinations?category=...) */}
      <section className="max-w-6xl mx-auto mt-12 mb-16 px-4">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-white text-center mb-3">Featured Tours</h2>
        <p className="text-center text-slate-300 mb-8">Discover Kenya through our carefully curated experiences that go beyond traditional tourism</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { key: 'Historical', title: 'Historical, Cultural & Art', icon: '🏛️', desc: "Immerse yourself in Kenya's rich heritage and artistry", tags: ['Kazuri Beads','Maasai Market','Karen Blixen Museum'] },
            { key: 'Wildlife', title: 'Wildlife', icon: '🦁', desc: "Encounter Kenya's incredible wildlife up close", tags: ['Nairobi NP','Giraffe Centre','Sheldrick'] },
            { key: 'Nature', title: "Hiking, Picnic, Camping & Nature", icon: '🥾', desc: "Explore Kenya's breathtaking natural landscapes", tags: ['Ngong Hills','Karura Forest',"Hell's Gate"] },
            { key: 'Farming', title: 'Farming, Coffee & Tea', icon: '🌿', desc: "Educational experiences in Kenya's agricultural heritage", tags: ['Fairview Coffee','Kiambethu Tea'] }
          ].map((t) => (
            <article
              key={t.key}
              role="button"
              tabIndex={0}
              aria-label={`View ${t.title} tours`}
              onClick={() => navigate(`/destinations?category=${encodeURIComponent(t.key)}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/destinations?category=${encodeURIComponent(t.key)}`);
                }
              }}
              className="rounded-2xl p-8 bg-gradient-to-br from-slate-900/80 to-slate-900/70 border border-white/6 shadow-lg cursor-pointer transform transition-all duration-300 hover:-translate-y-3 hover:scale-[1.01] hover:shadow-2xl group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-50 text-orange-600 text-2xl">{t.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-0 font-serif group-hover:text-amber-200">{t.title}</h3>
                </div>
                <div className="text-sm text-slate-400 group-hover:text-slate-200">Explore →</div>
              </div>

              <p className="text-sm text-slate-300 mb-6">{t.desc}</p>

              <div className="flex flex-wrap gap-2 mt-auto">
                {t.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/6 text-slate-300 group-hover:bg-white/6 group-hover:text-white transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Why Choose Us? — modern + classic design */}
      <section id="why-choose-us" className="max-w-6xl mx-auto mt-12 mb-16 px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">Why Choose Us?</h2>
          <p className="mt-3 text-lg text-slate-300 max-w-3xl mx-auto">We don't just plan trips — we curate moments that leave a mark</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div role="button" tabIndex={0} onClick={() => handleSelect('exceptional-service')} onKeyDown={(e) => (e.key === 'Enter' ? handleSelect('exceptional-service') : null)} className="cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_20px_50px_rgba(249,115,22,0.16)] hover:ring-2 hover:ring-orange-400/30 flex flex-col items-start gap-4 p-6 rounded-2xl bg-gradient-to-b from-white/5 to-white/2 border border-white/6 shadow-xl backdrop-blur-md">
            <div className="p-3 rounded-full bg-orange-50 text-orange-600"><Award className="w-6 h-6" /></div>
            <h3 className="text-lg font-semibold text-white">Exceptional Service</h3>
            <p className="text-sm text-slate-300">Professional, warm, responsive service that exceeds expectations at every touchpoint.</p>
          </div>

          <div role="button" tabIndex={0} onClick={() => handleSelect('unforgettable-experiences')} onKeyDown={(e) => (e.key === 'Enter' ? handleSelect('unforgettable-experiences') : null)} className="cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_20px_50px_rgba(249,115,22,0.16)] hover:ring-2 hover:ring-orange-400/30 flex flex-col items-start gap-4 p-6 rounded-2xl bg-gradient-to-b from-white/5 to-white/2 border border-white/6 shadow-xl backdrop-blur-md">
            <div className="p-3 rounded-full bg-orange-50 text-orange-600"><Heart className="w-6 h-6" /></div>
            <h3 className="text-lg font-semibold text-white">Unforgettable Experiences</h3>
            <p className="text-sm text-slate-300">Deep cultural immersion and authentic connections that create lasting memories.</p>
          </div>

          <div role="button" tabIndex={0} onClick={() => handleSelect('safety-first')} onKeyDown={(e) => (e.key === 'Enter' ? handleSelect('safety-first') : null)} className="cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_20px_50px_rgba(249,115,22,0.16)] hover:ring-2 hover:ring-orange-400/30 flex flex-col items-start gap-4 p-6 rounded-2xl bg-gradient-to-b from-white/5 to-white/2 border border-white/6 shadow-xl backdrop-blur-md">
            <div className="p-3 rounded-full bg-orange-50 text-orange-600"><ShieldCheck className="w-6 h-6" /></div>
            <h3 className="text-lg font-semibold text-white">Safety First</h3>
            <p className="text-sm text-slate-300">Secure booking, trusted guides, and comprehensive safety measures for peace of mind.</p>
          </div>

          <div role="button" tabIndex={0} onClick={() => handleSelect('stories-worth-telling')} onKeyDown={(e) => (e.key === 'Enter' ? handleSelect('stories-worth-telling') : null)} className="cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_20px_50px_rgba(249,115,22,0.16)] hover:ring-2 hover:ring-orange-400/30 flex flex-col items-start gap-4 p-6 rounded-2xl bg-gradient-to-b from-white/5 to-white/2 border border-white/6 shadow-xl backdrop-blur-md">
            <div className="p-3 rounded-full bg-orange-50 text-orange-600"><Users className="w-6 h-6" /></div>
            <h3 className="text-lg font-semibold text-white">Stories Worth Telling</h3>
            <p className="text-sm text-slate-300">Not just trips, but meaningful connections and experiences that transform perspectives.</p>
          </div>
        </div>
      </section>

      {/* What Our Travelers Say — modern, world-class cards */}
      <section className="max-w-6xl mx-auto mt-12 mb-16 px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">What Our Travelers Say</h2>
          <p className="mt-3 text-lg text-slate-300 max-w-3xl mx-auto">Real stories from real adventures</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <article
              key={t.id}
              className="rounded-2xl p-8 bg-gradient-to-b from-white/5 to-white/2 dark:from-black/40 dark:to-black/30 border border-white/6 backdrop-blur-md shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_30px_60px_rgba(3,7,18,0.6)] hover:ring-2 hover:ring-orange-400/30 flex flex-col items-center text-center gap-4"
              role="group"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-orange-50 text-orange-600 p-3 shadow-sm"><Star className="w-5 h-5" /></div>
                <div className="text-xs uppercase tracking-wider text-slate-300">Rating</div>
                <div className="text-lg font-semibold text-white tracking-wide">{'★'.repeat(t.rating)}</div>
              </div>

              <blockquote className="text-white italic text-xl md:text-2xl font-serif leading-relaxed max-w-xl mx-auto px-2 drop-shadow-sm">“{t.quote}”</blockquote>

              <div className="flex items-center gap-3 mt-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-400 to-yellow-300 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                  {t.author.slice(0, 1)}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-white">{t.author}</div>
                  <div className="text-xs text-slate-300">{t.location}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* keep other site sections/components */}
      <BlogSection />
      <Partners />
      <Footer />
    </div>
  );
};

export default Index;
