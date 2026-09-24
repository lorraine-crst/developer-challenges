import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  dictionaries,
  getStoredLanguage,
  storeLanguage,
  type Language,
  type TranslationKey,
} from './translations';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => getStoredLanguage());

  function setLanguage(next: Language) {
    setLanguageState(next);
    storeLanguage(next);
  }

  function toggleLanguage() {
    setLanguage(language === 'pt' ? 'en' : 'pt');
  }

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: (key: TranslationKey) => dictionaries[language][key],
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }

  return context;
}