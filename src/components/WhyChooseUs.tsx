import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Shield, Heart, Users } from 'lucide-react';

const WhyChooseUs = () => {
  const features = [
    {
      icon: Award,
      title: "Exceptional Service",
      description: "Professional, warm, responsive service that exceeds expectations at every touchpoint."
    },
    {
      icon: Heart,
      title: "Unforgettable Experiences",
      description: "Deep cultural immersion and authentic connections that create lasting memories."
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Secure booking, trusted guides, and comprehensive safety measures for peace of mind."
    },
    {
      icon: Users,
      title: "Stories Worth Telling",
      description: "Not just trips, but meaningful connections and experiences that transform perspectives."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-playfair text-primary mb-4">
            Why Choose Us?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We don't just plan trips — we curate moments that leave a mark
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-elevated transition-all duration-300 hover:-translate-y-2 text-center">
              <CardContent className="p-8">
                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-8 h-8 text-primary mx-auto" />
                </div>
                <h3 className="text-xl font-bold font-playfair text-primary mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;