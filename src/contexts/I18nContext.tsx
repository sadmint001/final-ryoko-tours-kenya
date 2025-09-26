import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Locale = 'en' | 'zh' | 'ja';

type Messages = Record<string, string>;

type I18nContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'site_locale';

import en from '@/locales/en.json';
import zh from '@/locales/zh.json';
import ja from '@/locales/ja.json';

const messages: Record<Locale, Messages> = { en, zh, ja };

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as Locale | null) || 'en';
    setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  const dict = messages[locale] || messages.en;

  const api = useMemo<I18nContextType>(() => ({
    locale,
    setLocale,
    t: (key: string) => dict[key] ?? messages.en[key] ?? key,
  }), [locale]);

  return <I18nContext.Provider value={api}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};


