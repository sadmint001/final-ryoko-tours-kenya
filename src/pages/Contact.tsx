import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import heroImage from '../assets/hero-safari.jpg';

// Custom WhatsApp Icon
const WhatsAppIcon = () => (
  <svg viewBox="0 0 32 32" className="w-6 h-6 text-white">
    <path
      fill="currentColor"
      d="M16.016 3C9.68 3 4.031 8.648 4.031 15c0 2.643.828 5.102 2.238 7.13L4 29l6.999-2.314c2.016 1.102 4.386 1.724 6.999 1.724 6.336 0 11.985-5.648 11.985-12S22.352 3 16.016 3zm0 21c-1.98 0-3.914-.524-5.575-1.514l-.4-.228-4.147 1.372 1.388-4.049-.263-.422C5.051 17.305 4.531 16.173 4.531 15c0-6.063 4.95-11 11.485-11S27.5 8.938 27.5 15 22.016 24 16.016 24zm5.8-7.3c-.08-.14-.29-.228-.615-.4-.328-.174-1.95-.964-2.254-1.072-.303-.108-.525-.174-.746.174-.222.348-.86 1.071-1.055 1.29-.194.218-.39.244-.717.086-.328-.156-1.38-.507-2.62-1.616-.968-.86-1.618-1.918-1.807-2.246-.19-.326-.02-.5.144-.654.148-.146.328-.39.492-.585.16-.194.214-.326.32-.543.108-.218.054-.407-.027-.573-.08-.165-.746-1.8-1.02-2.473-.27-.645-.546-.557-.746-.568-.194-.01-.42-.012-.645-.012s-.57.083-.87.397c-.296.313-1.128 1.104-1.128 2.695 0 1.591 1.157 3.126 1.318 3.343.162.218 2.274 3.465 5.52 4.861.772.334 1.373.533 1.841.683.773.24 1.478.206 2.036.125.62-.09 1.95-.797 2.228-1.566.27-.767.27-1.42.19-1.566z"
    />
  </svg>
);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget; // Capture form reference immediately
    setLoading(true);

    try {
      // 1. Send data to Supabase
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
            created_at: new Date().toISOString(),
            status: 'unread' // assuming a status column exists or default
          }
        ]);

      if (error) {
        console.error('Error saving message:', error);
        throw error; // Throw to catch block to prevent form submission and show error
      }

      // 2. Submit form to FormSubmit (email service) via AJAX
      // This prevents the redirect and "submit" errors, keeping the user on the site
      try {
        await fetch("https://formsubmit.co/ajax/info@ryokotoursafrica.com", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
            _captcha: "false"
          })
        });
      } catch (emailError) {
        console.error("Email service error:", emailError);
        // We don't block the success flow if email fails, since Supabase saved it.
      }

      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      console.error("Submission error:", err);
      toast({
        title: "Error",
        description: err.message || "There was an error sending your message. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };



  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      content: ["info@ryokotoursafrica.com", "booking@ryokotoursafrica.com", "support@ryokotoursafrica.com"],
      description: "We're available 24/7 via email"
    },
    {
      icon: Phone,
      title: "WhatsApp",
      content: "0797758216",
      description: "Instant support on WhatsApp"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      content: "Nairobi, Kenya",
      description: "Located in the CBD"
    },
    {
      icon: Clock,
      title: "Response Time",
      content: "Within 24 hours",
      description: "Fast, reliable support"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Navbar />

      {/* Hero Section */}
      <section
        className="relative h-[60vh] flex items-center justify-center bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${heroImage})` }}
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
            Contact Us
          </motion.h1>
          <p
            className="mt-4 text-lg md:text-xl max-w-2xl mx-auto"
            style={{ color: 'white' }}
          >
            Plan your dream safari or get assistance from our dedicated team.
          </p>
        </motion.div>
      </section>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/254797758216"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 p-4 rounded-full shadow-lg hover:scale-105 transition-transform z-50"
      >
        <WhatsAppIcon />
      </a>

      <main className="container mx-auto px-4 py-16 space-y-16">
        {/* Contact Grid */}
        <motion.div
          className="grid lg:grid-cols-3 gap-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl rounded-2xl border border-primary/20">
              <CardHeader>
                <CardTitle className="text-3xl font-display text-primary">Send a Message</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Fill in the form and our team will respond promptly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <input type="hidden" name="_captcha" value="false" />
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Your full name" required className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="your.email@example.com" required className="rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="Booking inquiry, custom trip, etc." required className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" name="message" value={formData.message} onChange={handleInputChange} placeholder="Tell us how we can help..." rows={6} required className="rounded-xl" />
                  </div>
                  <Button type="submit" className="w-full py-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 transition" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="hover:shadow-xl transition rounded-2xl border border-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl">
                      <info.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary text-lg mb-1">{info.title}</h3>
                      {Array.isArray(info.content) ? (
                        <ul className="text-foreground font-medium space-y-1">
                          {info.content.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      ) : <p className="text-foreground font-medium">{info.content}</p>}
                      <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Google Maps Embed */}
            <Card className="rounded-2xl shadow-lg overflow-hidden border border-border">
              <CardHeader>
                <CardTitle className="text-lg font-display text-primary">Our Location</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <iframe
                  className="w-full h-64"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.9427316906683!2d36.81724447507008!3d-1.283253936211109!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f173e6651b72d%3A0x89f87c64f8f382eb!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2sus!4v1694820197762!5m2!1sen!2sus"
                  loading="lazy"
                  title="Ryoko Tours Nairobi Map"
                />
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;