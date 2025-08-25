import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah M.",
      location: "Canada",
      content: "More than a tour — it was a connection.",
      rating: 5,
      image: "/api/placeholder/80/80"
    },
    {
      id: 2,
      name: "Brian K.",
      location: "Nairobi",
      content: "Professional, flexible, and unforgettable.",
      rating: 5,
      image: "/api/placeholder/80/80"
    },
    {
      id: 3,
      name: "Alina R.",
      location: "Germany",
      content: "A seamless blend of adventure and insight.",
      rating: 5,
      image: "/api/placeholder/80/80"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-playfair text-primary mb-4">
            What Our Travelers Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real stories from real adventures
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover:shadow-elevated transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <Quote className="w-8 h-8 text-primary/30 mx-auto mb-6" />
                
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-safari-gold fill-current" />
                  ))}
                </div>

                <blockquote className="text-lg font-medium text-foreground mb-6 italic">
                  "{testimonial.content}"
                </blockquote>

                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;