import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';

import WhyChooseUs from '@/components/WhyChooseUs';
import Testimonials from '@/components/Testimonials';
import BlogSection from '@/components/BlogSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <WhyChooseUs />

      <Testimonials />
      <BlogSection />
      <Footer />
    </div>
  );
};

export default Index;
