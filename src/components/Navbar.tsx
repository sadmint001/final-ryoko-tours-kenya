import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu, X, User, LogOut, Languages, ChevronDown, Check, Instagram, Facebook, Twitter, Globe, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { motion, AnimatePresence } from 'framer-motion';

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
const CustomLanguageSwitcher = ({ isMobile = false }: { isMobile?: boolean }) => {
  const { setLocale, locale: currentLocale } = useI18n();
  const [currentLangName, setCurrentLangName] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
    setIsMobileOpen(false);

    const googleCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (googleCombo) {
      googleCombo.value = langCode;
      googleCombo.dispatchEvent(new Event('change'));

      setTimeout(() => {
        setIsTranslating(false);
      }, 1000);
    } else {
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

  if (isMobile) {
    return (
      <div className="space-y-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-2 block">Language Selection</span>
        <div className="px-1">
          <div className="relative">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-accent/20 hover:bg-accent/30 border border-primary/10 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <Languages className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">{currentLangName}</span>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", isMobileOpen ? "rotate-180" : "")} />
            </button>

            <AnimatePresence>
              {isMobileOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 space-y-1 bg-accent/5 rounded-2xl overflow-hidden border border-primary/5"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code, lang.name, lang.locale)}
                      className={cn(
                        "w-full text-left px-4 py-3 hover:bg-primary/10 hover:text-primary transition-all duration-200 flex items-center justify-between",
                        currentLangName === lang.name ? 'bg-primary/5 text-primary' : ''
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{lang.flag}</span>
                        <span className={`text-xs ${currentLangName === lang.name ? 'font-bold' : 'font-medium'}`}>{lang.name}</span>
                      </div>
                      {currentLangName === lang.name && <Check className="w-3 h-3 text-primary" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

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
              className={cn(
                "w-full text-left px-4 py-3 hover:bg-primary/10 hover:text-primary transition-all duration-200 flex items-center justify-between group/item",
                currentLangName === lang.name ? 'bg-primary/5 text-primary' : ''
              )}
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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-primary/5 transition-all duration-500">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="group flex items-center gap-3" onClick={() => setIsOpen(false)}>
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <img
                    src="/lovable-uploads/7fb62c94-7164-4789-bdf7-04075cd81dc5.jpg"
                    alt="Ryoko Tours Africa Logo"
                    className="h-12 w-12 md:h-14 md:w-14 object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-sm filter contrast-[1.05]"
                  />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="font-marcellus text-lg md:text-xl font-bold tracking-tight text-foreground leading-none">RYOKO TOURS</span>
                  <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-primary uppercase leading-tight">Africa</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <div className="flex items-baseline space-x-2 lg:space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative group",
                      location.pathname === link.href
                        ? "text-primary font-bold"
                        : "text-foreground/80 hover:text-primary"
                    )}
                  >
                    <span className="relative z-10">{link.name}</span>
                    {location.pathname === link.href && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 bg-primary/5 rounded-full z-0"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-1/3 opacity-0 group-hover:opacity-100" />
                  </Link>
                ))}
              </div>

              <div className="h-6 w-px bg-border/40 mx-4 hidden lg:block" />

              <div className="flex items-center space-x-3">
                <ThemeToggle />
                <GoogleTranslateProvider />
                <CustomLanguageSwitcher />

                {user ? (
                  <div className="flex items-center gap-3">
                    <Link to="/admin" className="flex items-center gap-2 group">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                        <User className="w-4 h-4 text-primary group-hover:text-primary-foreground transition-colors" />
                      </div>
                    </Link>
                    <Button
                      onClick={handleSignOut}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 pl-2">
                    <Link to="/auth">
                      <span className="text-sm font-bold uppercase tracking-widest text-foreground/70 hover:text-primary transition-colors">Sign In</span>
                    </Link>
                    <Link to="/destinations">
                      <Button variant="safari" size="sm" className="rounded-full px-6 shadow-luxury">
                        Book Trip
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative z-[100] p-2 rounded-full bg-accent/50 text-foreground hover:text-primary transition-all duration-300 active:scale-90"
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div
                      key="close"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6 text-primary" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Premium Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md md:hidden"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[70] w-full max-w-[280px] bg-background/95 backdrop-blur-3xl border-l border-primary/10 shadow-luxury md:hidden flex flex-col pt-6"
            >
              {/* Decorative Savanna Accent */}
              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-luxury" />

              <div className="flex items-center justify-between px-6 mb-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] leading-none mb-1">Navigation</span>
                  <h2 className="font-marcellus text-2xl font-medium tracking-tight">Menu</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full bg-accent/50 text-foreground hover:text-primary transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-8 flex flex-col">

                <div className="space-y-1 mb-10">
                  {navLinks.map((link, idx) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.05, duration: 0.4 }}
                    >
                      <Link
                        to={link.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "group flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-300",
                          location.pathname === link.href
                            ? "bg-primary/10 text-primary shadow-sm"
                            : "text-foreground/80 hover:bg-accent/30 hover:text-primary"
                        )}
                      >
                        <span className={cn(
                          "text-xl font-marcellus transition-transform duration-300 group-hover:translate-x-1",
                          location.pathname === link.href ? "font-bold" : ""
                        )}>
                          {link.name}
                        </span>
                        <ArrowRight className={cn(
                          "w-4 h-4 transition-all duration-300",
                          location.pathname === link.href ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                        )} />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-auto pt-8 border-t border-primary/10 space-y-8">
                  {/* Language Settings Card */}
                  <div className="bg-accent/10 rounded-3xl p-5 border border-primary/5">
                    <CustomLanguageSwitcher isMobile={true} />
                  </div>

                  {/* Auth Actions */}
                  <div className="space-y-3">
                    {user ? (
                      <>
                        <div className="flex items-center gap-4 px-4 py-4 bg-primary/5 rounded-3xl border border-primary/10">
                          <div className="w-12 h-12 rounded-full bg-gradient-luxury p-[1px]">
                            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                              <User className="w-6 h-6 text-primary" />
                            </div>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold truncate leading-none mb-1">{user.user_metadata?.full_name || 'Guest Explorer'}</span>
                            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                          </div>
                        </div>
                        <Button
                          onClick={handleSignOut}
                          variant="outline"
                          className="w-full h-14 rounded-2xl border-destructive/20 text-destructive hover:bg-destructive/5 font-bold uppercase tracking-widest text-xs"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout Session
                        </Button>
                      </>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <Link to="/auth" className="w-full" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-xs">
                            Sign In
                          </Button>
                        </Link>
                        <Link to="/destinations" className="w-full" onClick={() => setIsOpen(false)}>
                          <Button variant="safari" className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-luxury">
                            Book Now
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-10 pb-6 text-center space-y-6">
                  <div className="flex items-center justify-center gap-6">
                    <a href="#" className="p-2 text-muted-foreground hover:text-primary transition-colors hover:scale-110 active:scale-95 duration-300">
                      <Instagram className="w-5 h-5" />
                    </a>
                    <a href="#" className="p-2 text-muted-foreground hover:text-primary transition-colors hover:scale-110 active:scale-95 duration-300">
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a href="#" className="p-2 text-muted-foreground hover:text-primary transition-colors hover:scale-110 active:scale-95 duration-300">
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a href="#" className="p-2 text-muted-foreground hover:text-primary transition-colors hover:scale-110 active:scale-95 duration-300">
                      <Globe className="h-5 w-5" />
                    </a>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">© 2024 Ryoko Tours Africa</p>
                    <p className="text-[9px] text-muted-foreground/60 italic">Luxury curations across the continent</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;