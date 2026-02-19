import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Globe, Shield, Users, ChevronRight, Gem, Compass, Target, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Services from '@/components/Services';
import whyUs2 from '@/assets/whyus2.jpg';
import { Link } from 'react-router-dom';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Passion for Africa",
      description: "We're deeply passionate about showcasing Africa's incredible diversity its landscapes, traditions, wildlife, and cultures.",
      gradient: "from-rose-500 to-pink-600",
      bgGradient: "from-rose-500/10 to-pink-600/10"
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Your safety is paramount. We adhere to international safety standards and collaborate with certified professionals.",
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-500/10 to-teal-600/10"
    },
    {
      icon: Globe,
      title: "Sustainable Tourism",
      description: "We promote responsible eco-tourism that uplifts communities and protects natural ecosystems for generations to come.",
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-500/10 to-indigo-600/10"
    },
    {
      icon: Users,
      title: "Expert Guides",
      description: "Our local guides carry centuries of knowledge, storytelling heritage, and a deep understanding of Kenya's culture.",
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-500/10 to-orange-600/10"
    }
  ];



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax-like effect (fixed bg) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed transform scale-105 transition-transform duration-[20s] hover:scale-100"
          style={{ backgroundImage: `url(${whyUs2})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-slate-900/90 dark:to-slate-900"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-px bg-amber-500"></div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-200">Our Story</span>
              <div className="w-8 h-px bg-amber-500"></div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold font-serif text-white mb-6 drop-shadow-2xl !text-white">
              Tapestry of <span className="italic text-amber-400">Experience</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto leading-relaxed drop-shadow-lg !text-slate-200">
              Every journey we create is a masterpiece  a blend of Kenya's rhythm, soul, and the stories waiting to be lived.
            </p>
          </motion.div>
        </div>


      </section>

      {/* Breadcrumb - Styling updated */}
      <div className="bg-white/50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 pt-24 pb-4">
        <div className="container mx-auto px-4 flex items-center gap-2 text-sm">
          <Link to="/" className="text-slate-500 hover:text-amber-600 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-slate-800 dark:text-white">About Us</span>
        </div>
      </div>

      <main className="container mx-auto px-4 py-16 md:py-24 space-y-20 md:space-y-32">

        {/* Introduction */}
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-slate-800 dark:text-white">
              Who We Are
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-600 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-6 text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-light">
            <p>
              Ryoko Tours Africa isn't just a travel company we're curators of wonder weaving stories of discovery, culture, and adventure into each journey.
            </p>
            <p>
              Inspired by the name "Ryoko," meaning "journey," we aim to reveal the heart of Kenya and Africa from the golden savannahs to the vibrant city streets.
            </p>
            <p>
              Our commitment goes beyond destinations. We celebrate people, heritage, and authentic moments that connect travelers to the true spirit of Africa.
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 relative">
          {/* Decorative background blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-amber-100/20 to-orange-100/20 dark:from-amber-900/10 dark:to-orange-900/10 blur-3xl rounded-full -z-10"></div>

          <Card className="border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
            <CardContent className="p-6 md:p-10 lg:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Target className="w-32 h-32" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold font-serif text-slate-800 dark:text-white mb-4">Our Mission</h2>
              <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                To craft transformative travel experiences that immerse our guests in Africa's soul, fostering cultural connection, growth, and adventure.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
            <CardContent className="p-6 md:p-10 lg:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Lightbulb className="w-32 h-32" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-6">
                <Lightbulb className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold font-serif text-slate-800 dark:text-white mb-4">Our Vision</h2>
              <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                To position Kenya and Africa as global leaders in authentic, sustainable tourism — where every traveler leaves as an ambassador of the continent's beauty.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <section>
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-slate-800 dark:text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-slate-500 dark:text-slate-400">The pillars that guide every journey we curate</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="group relative bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${value.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                <div className="relative z-10 flex flex-col sm:flex-row gap-4 md:gap-6 items-start sm:items-center">
                  <div className={`
                    w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-2xl 
                    bg-gradient-to-br ${value.gradient} 
                    flex items-center justify-center text-white shadow-lg
                    transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500
                  `}>
                    <value.icon className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-2 md:mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {value.title}
                    </h3>
                    <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="relative rounded-2xl md:rounded-[3rem] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 z-0"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=2671&auto=format&fit=crop')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>

          <div className="relative z-10 py-24 px-6 text-center max-w-4xl mx-auto">
            <Compass className="w-12 h-12 text-amber-400 mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl md:text-6xl font-bold font-serif text-white mb-8 leading-tight">
              Begin your journey with us together, let's create a story worth telling.
            </h2>

            <Link to="/destinations">
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-full px-10 py-5 text-xl shadow-2xl hover:shadow-orange-500/50 hover:-translate-y-1 transform transition-all duration-300">
                Explore Destinations <ChevronRight className="w-5 h-5" />
              </span>
            </Link>
          </div>
        </div>
      </main>

      <Services />
      <Footer />
    </div>
  );
};

export default About;