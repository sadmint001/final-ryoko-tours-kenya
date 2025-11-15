import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu, X, User, LogOut, Languages } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';

// ✅ Enhanced Google Translate Component for Navbar
const GoogleTranslate: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const scriptId = 'google-translate-script';
    
    // Prevent multiple script loads
    if (!document.getElementById(scriptId)) {
      const addScript = document.createElement('script');
      addScript.id = scriptId;
      addScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      addScript.async = true;
      document.body.appendChild(addScript);
    }

    // Initialize Google Translate
    (window as any).googleTranslateElementInit = () => {
      // Clean up any existing instances
      const existingElement = document.getElementById('google_translate_element_navbar');
      if (existingElement) {
        existingElement.innerHTML = '';
      }

      if (document.getElementById('google_translate_element_navbar')) {
        try {
          new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,ja,zh-CN,zh-TW,ko,fr,de,es,it,ru,ar,pt',
              layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            'google_translate_element_navbar'
          );
          setIsInitialized(true);
          
          // Force the widget to stay visible
          restoreTranslateWidget();
        } catch (error) {
          console.warn('Google Translate initialization error:', error);
        }
      }
    };

    // If script is already loaded, initialize immediately
    if ((window as any).google?.translate?.TranslateElement) {
      (window as any).googleTranslateElementInit();
    }

    // Set up interval to maintain the widget
    const intervalId = setInterval(() => {
      restoreTranslateWidget();
    }, 1000);

    // Restore on route changes
    const restoreOnNavigation = () => {
      setTimeout(restoreTranslateWidget, 100);
    };

    window.addEventListener('popstate', restoreOnNavigation);
    window.addEventListener('pushState', restoreOnNavigation);

    // Cleanup function
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('popstate', restoreOnNavigation);
      window.removeEventListener('pushState', restoreOnNavigation);
    };
  }, []);

  // Function to restore and maintain the translate widget
  const restoreTranslateWidget = () => {
    // Remove Google's banner that hides content
    const banners = document.querySelectorAll('.goog-te-banner-frame');
    banners.forEach(banner => {
      if (banner.parentNode) {
        banner.parentNode.removeChild(banner);
      }
    });

    // Remove the top bar that pushes content down
    const topBar = document.querySelector('.goog-te-banner-frame');
    if (topBar) {
      (topBar as HTMLElement).style.display = 'none';
    }

    // Ensure the translate widget container is visible
    const translateContainer = document.getElementById('google_translate_element_navbar');
    if (translateContainer) {
      translateContainer.style.display = 'block';
      translateContainer.style.visibility = 'visible';
      translateContainer.style.opacity = '1';
    }

    // Remove any iframes that might cover content
    const iframes = document.querySelectorAll('.goog-te-banner-frame iframe');
    iframes.forEach(iframe => {
      (iframe as HTMLElement).style.display = 'none';
    });
  };

  // Apply custom styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      /* Completely hide Google Translate banner and branding */
      .goog-te-banner-frame {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        width: 0 !important;
        opacity: 0 !important;
        position: absolute !important;
        z-index: -9999 !important;
      }
      
      .goog-te-banner {
        display: none !important;
      }
      
      .goog-logo-link {
        display: none !important;
      }
      
      .goog-te-gadget span {
        display: none !important;
      }
      
      /* Hide the language bar that appears at top */
      .goog-te-banner-frame.skiptranslate {
        display: none !important;
        visibility: hidden !important;
      }
      
      body {
        top: 0 !important;
      }
      
      /* Style the select dropdown to match your theme */
      .goog-te-gadget {
        color: transparent !important;
        font-size: 0 !important;
      }
      
      .goog-te-gadget select {
        background: hsl(var(--background));
        border: 1px solid hsl(var(--border));
        border-radius: 6px;
        padding: 6px 32px 6px 12px;
        color: hsl(var(--foreground));
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='hsl(var(--foreground))' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 16px;
        min-width: 140px;
        transition: all 0.2s ease-in-out;
      }
      
      .goog-te-gadget select:hover {
        border-color: hsl(var(--primary));
        background-color: hsl(var(--accent));
      }
      
      .goog-te-gadget select:focus {
        outline: none;
        border-color: hsl(var(--primary));
        box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
      }
      
      /* Mobile styles */
      @media (max-width: 768px) {
        .goog-te-gadget select {
          width: 100%;
          margin-top: 8px;
          min-width: unset;
        }
        
        #google_translate_element_navbar {
          width: 100%;
        }
      }
      
      /* Ensure the widget container is always visible */
      #google_translate_element_navbar {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: relative !important;
        z-index: 50 !important;
      }
      
      /* Prevent page shift when translate loads */
      body {
        margin-top: 0 !important;
        position: static !important;
      }
      
      /* Hide any Google translate iframes */
      .goog-te-banner-frame,
      .goog-te-menu-frame,
      .goog-te-ftab-frame {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        width: 0 !important;
      }
    `;
    document.head.appendChild(style);

    // Apply styles immediately and on interval
    restoreTranslateWidget();
    const styleInterval = setInterval(restoreTranslateWidget, 2000);

    return () => {
      document.head.removeChild(style);
      clearInterval(styleInterval);
    };
  }, [isInitialized]);

  // Additional effect to handle route changes and maintain widget
  useEffect(() => {
    const handleRouteChange = () => {
      // Small delay to ensure DOM is updated after route change
      setTimeout(() => {
        restoreTranslateWidget();
        
        // Re-initialize if widget is missing
        const widget = document.getElementById('google_translate_element_navbar');
        if (widget && !widget.querySelector('select')) {
          if ((window as any).google?.translate?.TranslateElement) {
            (window as any).googleTranslateElementInit();
          }
        }
      }, 500);
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    // Override pushState to detect navigation
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleRouteChange();
    };

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      history.pushState = originalPushState;
    };
  }, []);

  return (
    <div className="flex items-center">
      <Languages className="w-4 h-4 mr-2 text-muted-foreground flex-shrink-0" />
      <div 
        id="google_translate_element_navbar"
        className="google-translate-container"
        key="google-translate-widget" // Force re-render
      ></div>
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const { t } = useI18n();

  const navLinks = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.destinations'), href: '/destinations' },
    { name: t('nav.blog'), href: '/blog' },
    { name: t('nav.why'), href: '/why-us' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.contact'), href: '/contact' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md shadow-warm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="group">
              <img 
                src="/lovable-uploads/7fb62c94-7164-4789-bdf7-04075cd81dc5.png" 
                alt="Ryoko Africa Tours Logo" 
                className="h-14 w-14 md:h-16 md:w-16 object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-sm"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium font-opensans transition-colors duration-300 hover:bg-accent/50 ${
                    location.pathname === link.href ? 'text-primary bg-accent/30' : ''
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {/* Google Translate - Always available */}
              <GoogleTranslate />
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <Button 
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/destinations">
                    <Button variant="safari" size="default">
                      Book Now
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="outline" size="default">
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card rounded-lg mt-2 shadow-elevated">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium font-opensans transition-colors duration-300 ${
                    location.pathname === link.href ? 'text-primary bg-accent/30' : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="px-3">
                  <ThemeToggle />
                </div>
                <div className="px-3">
                  <GoogleTranslate />
                </div>
              </div>
              
              {user ? (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center space-x-2 text-muted-foreground px-3">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="px-3">
                    <Button 
                      onClick={handleSignOut}
                      variant="outline"
                      className="w-full"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="px-3">
                    <Link to="/destinations" onClick={() => setIsOpen(false)}>
                      <Button variant="safari" size="default" className="w-full">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                  <div className="px-3">
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;