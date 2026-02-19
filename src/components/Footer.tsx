import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Compass, MessageCircle, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const navigate = useNavigate();

  const handleTourLinkClick = (e: React.MouseEvent, category: string) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const element = document.getElementById('featured-tours');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/?scroll=featured-tours');
    }
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      window.scrollTo(0, 0);
    }
  };

  const footerLinks = [
    {
      title: "Navigation",
      links: [
        { name: "Home", href: "/" },
        { name: "Destinations", href: "/destinations" },
        { name: "About Us", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Privacy Policy", href: "/privacy-policy" },
      ]
    },
    {
      title: "Tour Experiences",
      links: [
        { name: "Wildlife Safari", href: "#", category: "Wildlife" },
        { name: "Cultural & Arts", href: "#", category: "Historical" },
        { name: "Nature & Hiking", href: "#", category: "Nature" },
        { name: "Farming & Coffee", href: "#", category: "Farming" },
        { name: "Signature Luxe", href: "#", category: "Signature" },
      ]
    },
    {
      title: "Contact",
      links: [
        { name: "info@ryokotoursafrica.com", href: "mailto:info@ryokotoursafrica.com", icon: Mail },
        { name: "+254 797 758 216", href: "https://wa.me/254797758216", icon: MessageCircle },
        { name: "Nairobi, Kenya", href: "https://www.google.com/maps/search/?api=1&query=Nairobi%2C%20Kenya", icon: MapPin },
      ]
    }
  ];

  return (
    <footer className="relative bg-earth-brown dark:bg-[#0a0a0a] text-white pt-24 pb-12 overflow-hidden transition-colors duration-500">
      {/* Exotic Cinematic Overlays */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-600/10 dark:bg-amber-600/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-600/10 dark:bg-orange-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Identity */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-serif font-bold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                RYOKO TOURS
              </h3>
              <div className="h-0.5 w-12 bg-amber-500" />
            </div>
            <p className="text-white/80 dark:text-slate-400 text-lg leading-relaxed font-medium">
              Curating exotic African journeys that transcend traditional travel. Immerse yourself in the soul of Kenya through our authentic, high-end experiences.
            </p>
            <div className="flex gap-4">
              {[
                { icon: MessageCircle, href: "https://wa.me/254797758216" },
                { icon: Instagram, href: "https://instagram.com/ryokotoursafrica" },
                { icon: Mail, href: "mailto:info@ryokotoursafrica.com" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/10 dark:bg-white/5 border border-white/20 rounded-2xl flex items-center justify-center hover:bg-amber-500/10 hover:border-amber-500/30 transition-all duration-300 group"
                >
                  <social.icon className="w-5 h-5 text-white/70 dark:text-slate-400 group-hover:text-amber-500 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic Sections */}
          {footerLinks.map((section, index) => (
            <div key={index} className="space-y-8">
              <h4 className="text-sm font-bold uppercase tracking-[0.3em] text-amber-500">
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {(() => {
                      const isExternal = link.href.startsWith('http') || link.href.startsWith('mailto');
                      const commonClasses = "text-white/70 dark:text-slate-400 hover:text-white transition-all duration-300 flex items-center gap-2 group text-lg";
                      const content = (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                          {link.icon && <link.icon className="w-5 h-5 text-amber-500/80 shrink-0" />}
                          <span className="flex-grow">{link.name}</span>
                          <ArrowUpRight className="w-4 h-4 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all shrink-0 text-amber-500" />
                        </>
                      );

                      if (section.title === "Tour Experiences") {
                        return (
                          <a
                            href={link.href}
                            onClick={(e) => link.category && handleTourLinkClick(e, link.category)}
                            className={commonClasses}
                          >
                            {content}
                          </a>
                        );
                      }

                      if (isExternal) {
                        return (
                          <a
                            href={link.href}
                            target={link.href.startsWith('http') ? "_blank" : undefined}
                            rel={link.href.startsWith('http') ? "noopener noreferrer" : undefined}
                            className={commonClasses}
                          >
                            {content}
                          </a>
                        );
                      }

                      return (
                        <Link
                          to={link.href}
                          onClick={(e) => link.name === "Home" && handleHomeClick(e)}
                          className={commonClasses}
                        >
                          {content}
                        </Link>
                      );
                    })()}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Global Branding Bottom Bar */}
        <div className="pt-12 border-t border-white/10 dark:border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <Compass className="w-5 h-5 text-amber-500" />
              <p className="text-white/60 dark:text-slate-500 text-sm font-medium tracking-wide">
                © {currentYear} RYOKO TOURS AFRICA. BEYOND IMAGINATION.
              </p>
            </div>
            <div className="flex gap-10">
              <Link to="/privacy-policy" className="text-white/50 dark:text-slate-600 hover:text-amber-500 text-xs font-bold uppercase tracking-widest transition-colors">
                Privacy
              </Link>
              <Link to="/admin" className="text-white/50 dark:text-slate-600 hover:text-amber-500 text-xs font-bold uppercase tracking-widest transition-colors">
                Registry
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;