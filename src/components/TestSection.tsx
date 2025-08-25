import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Palette, Zap, Heart } from 'lucide-react';

const TestSection = () => {
  return (
    <section className="py-20 bg-gradient-earth">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold font-playfair text-foreground mb-4">
            Design System Test
          </h2>
          <p className="text-lg font-opensans text-muted-foreground max-w-2xl mx-auto">
            Testing our beautiful African-inspired design system with custom colors, gradients, and animations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Color Palette Card */}
          <Card className="p-8 bg-card shadow-warm hover:shadow-elevated transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-safari rounded-full mx-auto mb-4 flex items-center justify-center">
                <Palette className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold font-playfair text-foreground mb-2">
                Color Palette
              </h3>
              <p className="font-opensans text-muted-foreground">
                Warm earth tones inspired by African sunsets and landscapes.
              </p>
            </div>
          </Card>

          {/* Animations Card */}
          <Card className="p-8 bg-card shadow-warm hover:shadow-elevated transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-sunset rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold font-playfair text-foreground mb-2">
                Smooth Animations
              </h3>
              <p className="font-opensans text-muted-foreground">
                Gentle transitions and hover effects for a premium feel.
              </p>
            </div>
          </Card>

          {/* Typography Card */}
          <Card className="p-8 bg-card shadow-warm hover:shadow-elevated transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-earth-brown rounded-full mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold font-playfair text-foreground mb-2">
                Beautiful Typography
              </h3>
              <p className="font-opensans text-muted-foreground">
                Playfair Display and Open Sans for elegant readability.
              </p>
            </div>
          </Card>
        </div>

        {/* Button Variants Test */}
        <div className="text-center">
          <h3 className="text-2xl font-semibold font-playfair text-foreground mb-8">
            Button Variants
          </h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="default">Default</Button>
            <Button variant="safari">Safari</Button>
            <Button variant="hero">Hero</Button>
            <Button variant="earth">Earth</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
          </div>
        </div>

        {/* Color Swatches */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold font-playfair text-foreground mb-8">
            Color Swatches
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-full h-16 bg-primary rounded-lg mb-2"></div>
              <p className="font-opensans text-sm">Primary</p>
            </div>
            <div className="text-center">
              <div className="w-full h-16 bg-safari-gold rounded-lg mb-2"></div>
              <p className="font-opensans text-sm">Safari Gold</p>
            </div>
            <div className="text-center">
              <div className="w-full h-16 bg-sunset-orange rounded-lg mb-2"></div>
              <p className="font-opensans text-sm">Sunset Orange</p>
            </div>
            <div className="text-center">
              <div className="w-full h-16 bg-earth-brown rounded-lg mb-2"></div>
              <p className="font-opensans text-sm">Earth Brown</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestSection;