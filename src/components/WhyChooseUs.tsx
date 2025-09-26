import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
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

  const stepColors = [
    'from-fuchsia-500 to-purple-500',
    'from-indigo-500 to-blue-500',
    'from-sky-500 to-cyan-500',
    'from-amber-500 to-orange-500',
  ];

  const total = features.length;

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

        {/* Diagram layout: left circle + right step list */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
          {/* Circular summary */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-56 h-56 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shadow-[inset_0_0_30px_rgba(0,0,0,0.15)]">
              <div className="absolute inset-3 rounded-full border-2 border-primary/20" />
              <div className="absolute inset-6 rounded-full border-2 border-primary/10" />
              <div className="text-center">
                <div className="text-6xl font-bold font-playfair text-primary leading-none">{total}</div>
                <div className="mt-2 text-sm uppercase tracking-wide text-muted-foreground">Things to Include</div>
              </div>
            </div>
          </div>

          {/* Right stepped list */}
          <div className="lg:col-span-2">
            <ol className="relative space-y-6">
              <span className="hidden lg:block absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-border to-transparent" />
              {features.map((feature, index) => (
                <li key={feature.title} className="relative">
                  <div className="flex items-start gap-4">
                    {/* Step badge */}
                    <div className={`shrink-0 rounded-xl bg-gradient-to-r ${stepColors[index % stepColors.length]} text-white px-3 py-2 shadow-md`}>
                      <div className="text-[10px] uppercase opacity-80 leading-none">Step</div>
                      <div className="text-lg font-bold leading-none">{String(index + 1).padStart(2,'0')}</div>
                    </div>

                    {/* Content card */}
                    <Link to={`/why-us#${feature.title.toLowerCase().replace(/\s+/g,'-')}`} aria-label={`Read more about ${feature.title}`} className="group flex-1">
                      <div className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-5 shadow-sm group-hover:shadow-elevated transition-all">
                        <div className="flex items-center gap-3 mb-2">
                          <feature.icon className="w-5 h-5 text-primary" />
                          <h3 className="text-lg md:text-xl font-semibold text-foreground font-playfair">{feature.title}</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;