import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import BlogSection from '@/components/BlogSection';
import Footer from '@/components/Footer';
import PartnersSection from '@/components/Partners';
import TestimonialsSection from '@/components/TestimonialsSection';
import FeaturedToursSection from '@/components/FeaturedToursSection';
import WhyChooseUsSection from '@/components/WhyChooseUsSection';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
      {/* Navbar with integrated Google Translate */}
      <Navbar />

      <HeroSection />

      {/* Featured Tours Section */}
      <FeaturedToursSection />

      {/* Why Choose Us Section */}
      <WhyChooseUsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      <BlogSection />

      {/* Partners Section */}
      <PartnersSection />

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;