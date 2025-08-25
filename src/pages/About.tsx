import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Globe, Shield, Users, Award, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Services from '@/components/Services';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Passion for Africa",
      description: "We're deeply passionate about showcasing Africa's incredible diversity, from its breathtaking landscapes to its rich cultural heritage."
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Your safety is our top priority. We maintain the highest safety standards and work with certified guides and operators."
    },
    {
      icon: Globe,
      title: "Sustainable Tourism",
      description: "We're committed to responsible tourism that benefits local communities and preserves Africa's natural wonders for future generations."
    },
    {
      icon: Users,
      title: "Expert Guides",
      description: "Our experienced local guides bring insider knowledge and authentic stories that make every journey unforgettable."
    }
  ];

  const stats = [
    { number: "15+", label: "Years Experience" },
    { number: "50+", label: "Destinations" },
    { number: "10k+", label: "Happy Travelers" },
    { number: "98%", label: "Satisfaction Rate" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/10">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-6">
            Tapestry of Experience!
          </h1>
          <div className="max-w-4xl mx-auto space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              At Ryoko Tours Africa, we don't just plan trips — we curate moments that leave a mark.
            </p>
            <p>
              We specialize in personalized, memory-filled tours for both local and international travelers.
              Rooted in our name — Ryoko, meaning "travel" — our passion is guiding people through Kenya's 
              lesser-seen sides with authenticity, depth, and heart.
            </p>
            <p>
              From vibrant city streets to quiet forest trails, every journey with us is handcrafted to 
              reflect the rhythms of Kenya and the stories that live within its land.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mission & Vision Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-3xl font-display font-bold text-primary mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To offer memorable and personalized tour services that connect travelers with 
                Kenya's people, nature, and soul.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20">
            <CardContent className="p-8">
              <h2 className="text-3xl font-display font-bold text-primary mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To become a leading brand in guiding both Kenyans and the world through rich, 
                meaningful experiences that go beyond the surface.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-display font-bold text-primary text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="group hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-primary mb-2">{value.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-display font-bold text-primary text-center mb-12">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center group hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-8">
                <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-3">Award-Winning Service</h3>
                <p className="text-muted-foreground">
                  Recognized for excellence in African tourism with multiple industry awards.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center group hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-8">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-3">Small Group Experiences</h3>
                <p className="text-muted-foreground">
                  Intimate group sizes ensure personalized attention and authentic experiences.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center group hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-8">
                <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-3">Local Partnerships</h3>
                <p className="text-muted-foreground">
                  Strong relationships with local communities create unique, off-the-beaten-path experiences.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <Card className="bg-background text-center border border-orange-200">
          <CardContent className="p-8 md:p-12">
            <h2 className="text-3xl font-display font-bold mb-4">
              Ready for Your African Adventure?
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Let us help you create memories that will last a lifetime
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="text-primary">
                Personalized Itineraries
              </Badge>
              <Badge variant="secondary" className="text-primary">
                Expert Local Guides
              </Badge>
              <Badge variant="secondary" className="text-primary">
                24/7 Support
              </Badge>
            </div>
            <div className="mt-8">
              <a href="/destinations">
                <span className="inline-block bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-semibold rounded-md px-4 md:px-6 py-2 transition-all">
                  Explore Destinations
                </span>
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
      <Services />
      <Footer />
    </div>
  );
};

export default About;