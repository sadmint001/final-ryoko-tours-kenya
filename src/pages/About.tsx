import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Globe, Shield, Users, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Services from '@/components/Services';
import whyUs2 from '@/assets/whyus2.jpg';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Passion for Africa",
      description:
        "We're deeply passionate about showcasing Africa's incredible diversity — its landscapes, traditions, wildlife, and cultures."
    },
    {
      icon: Shield,
      title: "Safety First",
      description:
        "Your safety is paramount. We adhere to international safety standards and collaborate with certified professionals."
    },
    {
      icon: Globe,
      title: "Sustainable Tourism",
      description:
        "We promote responsible eco-tourism that uplifts communities and protects natural ecosystems for generations to come."
    },
    {
      icon: Users,
      title: "Expert Guides",
      description:
        "Our local guides carry centuries of knowledge, storytelling heritage, and a deep understanding of Kenya's culture."
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

      {/* Updated Hero Section with whyus2.jpg and inline white text */}
      <section
        className="relative h-[60vh] flex items-center justify-center bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${whyUs2})` }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
        <motion.div
          className="relative z-10 text-center px-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.h1
            className="text-5xl md:text-6xl font-display font-bold drop-shadow-xl"
            style={{ color: 'white' }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1 }}
          >
            Tapestry of Experience
          </motion.h1>
          <p 
            className="mt-4 text-lg md:text-xl max-w-2xl mx-auto"
            style={{ color: 'white' }}
          >
            Every journey we create is a masterpiece — a blend of Kenya's rhythm, soul, and the stories waiting to be lived.
          </p>
        </motion.div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-t border-b border-orange-100 py-4 shadow-sm">
        <div className="container mx-auto flex items-center gap-2 text-muted-foreground text-sm md:text-base px-4">
          <a href="/" className="hover:text-orange-500 transition-colors">
            Home
          </a>
          <ChevronRight className="w-4 h-4 opacity-70" />
          <span className="font-medium text-primary">About Us</span>
        </div>
      </div>

      <main id="about-content" className="container mx-auto px-4 py-20 space-y-28">

        {/* Introduction */}
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in-up">
          <h2 className="text-5xl font-display font-bold text-primary">Who We Are</h2>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Ryoko Tours Africa isn't just a travel company — we're curators of wonder, weaving stories of discovery, culture, and adventure into each journey.
          </p>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Inspired by the name "Ryoko," meaning "journey," we aim to reveal the heart of Kenya and Africa — from the golden savannahs to the vibrant city streets.
          </p>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Our commitment goes beyond destinations. We celebrate people, heritage, and authentic moments that connect travelers to the true spirit of Africa.
          </p>
        </div>

       {/* Stats */}
    

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto animate-fade-in-up">
          <Card className="border-none backdrop-blur-xl bg-white/10 shadow-2xl rounded-2xl overflow-hidden">
            <CardContent className="p-12">
              <h2 className="text-4xl font-bold text-primary mb-4">Our Mission</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                To craft transformative travel experiences that immerse our guests in Africa's soul, fostering cultural connection, growth, and adventure.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none backdrop-blur-xl bg-white/10 shadow-2xl rounded-2xl">
            <CardContent className="p-12">
              <h2 className="text-4xl font-bold text-primary mb-4">Our Vision</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                To position Kenya and Africa as global leaders in authentic, sustainable tourism — where every traveler leaves as an ambassador of the continent's beauty.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <section className="max-w-6xl mx-auto animate-fade-in-up">
          <h2 className="text-5xl font-display font-bold text-primary text-center mb-16">
            Our Core Values
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
              Begin your journey with us — together, let's create a story worth telling.
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