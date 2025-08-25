import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Quick Links",
      links: [
        { name: "Home", href: "/" },
        { name: "Destinations", href: "/destinations" },
        { name: "About Us", href: "/about" },
        { name: "Contact", href: "/contact" },
      ]
    },
    {
      title: "Tour Types",
      links: [
        { name: "Cultural Trips", href: "/destinations?category=Cultural" },
        { name: "Safari Adventures", href: "/destinations?category=Wildlife" },
        { name: "City Tours", href: "/destinations?category=Historical" },
        { name: "Custom Experiences", href: "/destinations?category=Adventure" },
      ]
    },
    {
      title: "Contact Info",
      links: [
        { name: "info@ryokotoursafrica.com", href: "mailto:info@ryokotoursafrica.com", icon: Mail },
        { name: "0797758216", href: "https://wa.me/254797758216", icon: Phone },
        { name: "Nairobi, Kenya", href: "https://www.google.com/maps/search/?api=1&query=Nairobi%2C%20Kenya", icon: MapPin },
      ]
    }
  ];

  return (
    <footer className="bg-earth-brown text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold font-playfair text-safari-gold mb-4">
              Ryoko Tours Africa
            </h3>
            <p className="text-white/80 leading-relaxed mb-6">
              Curated adventures, cultural moments, and unforgettable memories — 
              from the wild to the streets of Kenya.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://wa.me/254797758216" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-safari-gold/20 transition-colors"
              >
                <Phone className="w-5 h-5" />
              </a>
              <a 
                href="mailto:info@ryokotoursafrica.com"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-safari-gold/20 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com/ryokotoursafrica" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-safari-gold/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h4 className="text-lg font-semibold font-playfair text-safari-gold mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {section.title === "Contact Info" ? (
                      <a
                        href={link.href}
                        className="text-white/80 hover:text-safari-gold transition-colors duration-300 flex items-center gap-2"
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {link.icon && <link.icon className="w-4 h-4" />}
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-white/80 hover:text-safari-gold transition-colors duration-300"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">
              © {currentYear} Ryoko Tours Africa. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="#" className="text-white/60 hover:text-safari-gold text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="#" className="text-white/60 hover:text-safari-gold text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;