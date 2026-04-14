import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import de from './de.json';
import en from './en.json';

// ── Types ──
type Lang = 'de' | 'en';
type Translations = Record<string, string>;

interface LanguageContextValue {
  lang: Lang;
  locale: string;            // BCP-47 locale for Intl APIs
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const TRANSLATIONS: Record<Lang, Translations> = { de, en };
const LOCALES: Record<Lang, string> = { de: 'de-DE', en: 'en-US' };
const STORAGE_KEY = 'ronki-lang';

function getInitialLang(): Lang {
  // 1. Explicit user choice (persisted from settings or onboarding)
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'de') return saved;
  } catch {}
  // 2. Auto-detect from browser / phone language config
  try {
    const browserLangs = navigator.languages ?? [navigator.language];
    for (const bl of browserLangs) {
      const tag = bl.toLowerCase();
      if (tag.startsWith('de')) return 'de';
      if (tag.startsWith('en')) return 'en';
    }
  } catch {}
  // 3. Fallback — primary audience is German-speaking
  return 'de';
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'de',
  locale: 'de-DE',
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>): string => {
    let str = TRANSLATIONS[lang][key] ?? TRANSLATIONS.de[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return str;
  }, [lang]);

  const value = useMemo(() => ({
    lang,
    locale: LOCALES[lang],
    setLang,
    t,
  }), [lang, setLang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}

export default LanguageContext;
