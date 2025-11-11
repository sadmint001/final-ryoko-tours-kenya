import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Globe, Shield, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Services from '@/components/Services';
import heroSafari from '../assets/hero-safari.jpg';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Passion for Africa",
      description: "We're deeply passionate about showcasing Africa's incredible diversity—its landscapes, traditions, wildlife, and cultures."
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Your safety is paramount. We adhere to international safety standards and collaborate with certified professionals."
    },
    {
      icon: Globe,
      title: "Sustainable Tourism",
      description: "We promote responsible eco-tourism that uplifts communities and protects natural ecosystems for future generations."
    },
    {
      icon: Users,
      title: "Expert Guides",
      description: "Our local guides carry centuries of knowledge, storytelling heritage, and a deep understanding of Kenya’s culture."
    }
  ];

  const stats = [
    { number: "15+", label: "Years Experience" },
    { number: "50+", label: "Destinations" },
    { number: "10k+", label: "Happy Travelers" },
    { number: "98%", label: "Satisfaction Rate" }
  ];

  return (
    <div className="min-h-screen bg-background scroll-smooth">

      <Navbar />

      {/* ✅ HERO WITH LAYERED PARALLAX */}
      <section
        className="relative h-screen bg-fixed bg-center bg-cover bg-no-repeat flex items-center justify-center"
        style={{ backgroundImage: `url(${heroSafari})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90"></div>

        {/* Subtle atmospheric fog */}
        <div className="absolute inset-0 opacity-30 bg-[url('/images/fog-layer.png')] bg-cover mix-blend-screen animate-pulse"></div>

        <div className="relative z-10 text-center text-white max-w-4xl px-4 animate-fade-in-up">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-wide mb-6 drop-shadow-lg">
            Experience Africa in Motion
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed opacity-90">
            Where breathtaking landscapes, heritage, and culture intertwine into unforgettable journeys.
          </p>

          <div className="mt-10">
            <a
              href="#about-content"
              className="inline-block bg-white/20 backdrop-blur-md border border-white/40 px-6 py-3 rounded-lg text-lg hover:bg-white/30 transition-all shadow-xl"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      <main id="about-content" className="container mx-auto px-4 py-20 space-y-28">

        {/* INTRO */}
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in-up">
          <h2 className="text-5xl font-display font-bold text-primary">
            Tapestry of Experience
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Ryoko Tours Africa is more than a travel company—we are storytellers weaving memories into every journey.
          </p>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Inspired by the name “Ryoko,” our mission is to show the world the untouched hearts of Kenya, beyond the ordinary.
          </p>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Whether you're exploring bustling streets or quiet wilderness, each journey reflects rhythm, identity, and heritage.
          </p>
        </div>

        {/* STATS + BACKGLOW */}
        <div className="relative max-w-4xl mx-auto animate-fade-in-up">
          {/* glow effect */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-orange-300/20 rounded-full blur-[150px]"></div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 relative z-10">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform">
                  {stat.number}
                </div>
                <div className="text-muted-foreground tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* MISSION & VISION with GLASSMORPHISM */}
        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto animate-fade-in-up">
          <Card className="border-none backdrop-blur-xl bg-white/10 shadow-2xl rounded-2xl overflow-hidden">
            <CardContent className="p-12">
              <h2 className="text-4xl font-bold text-primary mb-4">Our Mission</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                To craft meaningful, transformative journeys that immerse travelers in the beauty and soul of Kenya.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none backdrop-blur-xl bg-white/10 shadow-2xl rounded-2xl">
            <CardContent className="p-12">
              <h2 className="text-4xl font-bold text-primary mb-4">Our Vision</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                To elevate African tourism globally by delivering immersive experiences that enrich, educate, and inspire.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* VALUES with radial glow and motion */}
        <section className="max-w-6xl mx-auto animate-fade-in-up">
          <h2 className="text-5xl font-display font-bold text-primary text-center mb-16">
            Our Values
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            {values.map((value, index) => (
              <Card
                key={index}
                className="group border-none bg-white/5 backdrop-blur-lg shadow-xl rounded-xl hover:scale-[1.02] hover:shadow-2xl transition-all duration-300"
              >
                <CardContent className="p-10 flex gap-8 items-start">
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-300/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <value.icon className="relative w-10 h-10 text-primary z-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-primary mb-3">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <Card className="border-none shadow-2xl bg-gradient-to-br from-orange-200/40 to-yellow-100/40 backdrop-blur-xl text-center animate-fade-in-up rounded-2xl">
          <CardContent className="p-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-primary">
              Begin your journey. Let’s create something unforgettable together.
            </h2>

            <a href="/destinations">
              <span className="inline-block bg-gradient-to-r from-orange-500 to-yellow-500 hover:scale-110 transition-all text-black font-bold rounded-xl px-8 py-4 text-xl shadow-xl">
                Explore Destinations
              </span>
            </a>
          </CardContent>
        </Card>

      </main>

      <Services />
      <Footer />
    </div>
  );
};

export default About;
