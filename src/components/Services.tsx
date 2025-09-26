import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, Tent, Plane } from 'lucide-react';
import { Link } from 'react-router-dom';

const SERVICES_ALLOWED = [
  'Team Building & Corporate Retreats',
  'School Excursions',
  'Camping, Hiking & Training',
];

const Services = () => {
  const services = [
    {
      id: 1,
      title: "Team Building & Corporate Retreats",
      description: "Strengthen your team bonds with adventure-based activities in Kenya's stunning natural settings",
      icon: Users,
      features: ["Adventure challenges", "Leadership activities", "Scenic venues", "Professional facilitation"],
      image: "/lovable-uploads/8830a94e-8109-4438-99fc-7b8392c0c9c5.png"
    },
    {
      id: 2,
      title: "School Excursions",
      description: "Educational and fun trips designed to inspire learning through real-world experiences",
      icon: GraduationCap,
      features: ["Educational tours", "Wildlife learning", "Cultural experiences", "Safe supervision"],
      image: "/lovable-uploads/da389b0b-2c48-446a-93d4-03d23e502f85.png"
    },
    {
      id: 3,
      title: "Camping, Hiking & Training",
      description: "Outdoor adventures that challenge and inspire, perfect for building resilience and skills",
      icon: Tent,
      features: ["Mountain hiking", "Survival training", "Outdoor skills", "Group camping"],
      image: "/lovable-uploads/67714bb6-efb7-46fc-9d50-40094c91c610.png"
    }
  ];

  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-playfair text-primary mb-4">
            Our Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Beyond tours, we offer specialized services for groups, students, and international travelers
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.filter(s => SERVICES_ALLOWED.includes(s.title)).map((service) => {
            const IconComponent = service.icon;
            return (
              <Card key={service.id} className="group hover:shadow-elevated transition-all duration-300 overflow-hidden">
                <div 
                  className="h-48 bg-cover bg-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300"
                  style={{ backgroundImage: `url(${service.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold font-playfair text-white">
                      {service.title}
                    </h3>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-3">Key Features:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link to="/contact">
                    <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 transition-all text-black font-medium px-4 md:px-6">
                      Get Quote
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/contact">
            <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 transition-all text-black font-medium px-4 md:px-6">
              Contact Us for Custom Services
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;