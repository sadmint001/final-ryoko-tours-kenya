import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu, X, User, LogOut, Languages, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';

// ✅ Silent Google Translate Provider (Handles only script and initialization)
const GoogleTranslateProvider: React.FC = () => {
  useEffect(() => {
    const scriptId = 'google-translate-script';
    if (!document.getElementById(scriptId)) {
      const addScript = document.createElement('script');
      addScript.id = scriptId;
      addScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      addScript.async = true;
      document.body.appendChild(addScript);
    }

    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,ja,zh-CN,fr,de,es,it,ar',
          autoDisplay: false,
        },
        'google-translate-silent-holder'
      );
    };
  }, []);

  return <div id="google-translate-silent-holder" className="hidden invisible h-0 w-0 overflow-hidden" />;
};

// ✅ Custom Language Switcher Component
const CustomLanguageSwitcher = () => {
  const { setLocale, locale: currentLocale } = useI18n();
  const [currentLangName, setCurrentLangName] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', locale: 'en' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', locale: 'ja' },
    { code: 'zh-CN', name: 'Chinese', flag: '🇨🇳', locale: 'zh' },
    { code: 'fr', name: 'French', flag: '🇫🇷', locale: 'en' }, // Default to 'en' locale for unsupported UI languages
    { code: 'de', name: 'German', flag: '🇩🇪', locale: 'en' },
    { code: 'it', name: 'Italian', flag: '🇮🇹', locale: 'en' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', locale: 'en' },
  ];

  // Helper to set cookie
  const setTranslateCookie = (langCode: string) => {
    const domain = window.location.hostname;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain}`;
    document.cookie = `googtrans=/en/${langCode}; path=/;`; // Fallback for local dev
  };

  const changeLanguage = (langCode: string, langName: string, localeKey: any) => {
    if (langName === currentLangName) return;

    setIsTranslating(true);
    setTranslateCookie(langCode);
    setLocale(localeKey);
    setCurrentLangName(langName);

    const googleCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (googleCombo) {
      googleCombo.value = langCode;
      googleCombo.dispatchEvent(new Event('change'));

      setTimeout(() => {
        setIsTranslating(false);
      }, 1000);
    } else {
      // If the selector isn't ready, the cookie will handle it on reload
      // But we'll try a small delay and reload if it's still missing
      setTimeout(() => {
        const retryCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (retryCombo) {
          retryCombo.value = langCode;
          retryCombo.dispatchEvent(new Event('change'));
          setIsTranslating(false);
        } else {
          window.location.reload();
        }
      }, 500);
    }
  };

  // Sync initial state
  useEffect(() => {
    const savedCode = document.cookie.split('; ').find(row => row.startsWith('googtrans='))?.split('=')[1]?.split('/').pop();
    const activeLang = languages.find(l => l.code === (savedCode || 'en'));
    if (activeLang) {
      setCurrentLangName(activeLang.name);
    }
  }, []);

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-accent/30 hover:bg-accent/50 border border-slate-200 dark:border-white/20 transition-all duration-300 backdrop-blur-sm disabled:opacity-70 disabled:cursor-not-allowed" disabled={isTranslating}>
        {isTranslating ? (
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <Languages className="w-4 h-4 text-primary" />
        )}
        <span className="text-xs font-bold uppercase tracking-widest hidden lg:inline">{currentLangName}</span>
        <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:rotate-180 transition-transform" />
      </button>

      {/* Dropdown Menu */}
      <div className="absolute top-full right-0 mt-3 w-56 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-white/20 rounded-2xl shadow-luxury opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] overflow-hidden backdrop-blur-xl scale-95 group-hover:scale-100 origin-top-right">
        <div className="py-2 max-h-[350px] overflow-y-auto custom-scrollbar">
          <div className="px-4 py-2 border-b border-border/50 mb-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Language</span>
          </div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code, lang.name, lang.locale)}
              className={`
                  w-full text-left px-4 py-3 
                  hover:bg-primary/10 hover:text-primary 
                  transition-all duration-200 
                  flex items-center justify-between group/item
                  ${currentLangName === lang.name ? 'bg-primary/5 text-primary' : ''}
                `}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl drop-shadow-sm group-hover/item:scale-110 transition-transform">{lang.flag}</span>
                <span className={`text-sm ${currentLangName === lang.name ? 'font-bold' : 'font-medium'}`}>{lang.name}</span>
              </div>
              {currentLangName === lang.name && (
                <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
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
                src="/lovable-uploads/7fb62c94-7164-4789-bdf7-04075cd81dc5.jpg"
                alt="Ryoko Tours Africa Logo"
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
                  className={`text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium font-opensans transition-colors duration-300 hover:bg-accent/50 ${location.pathname === link.href ? 'text-primary bg-accent/30' : ''
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <GoogleTranslateProvider />
              <CustomLanguageSwitcher />
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
                  className={`text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium font-opensans transition-colors duration-300 ${location.pathname === link.href ? 'text-primary bg-accent/30' : ''
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
                  <CustomLanguageSwitcher />
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