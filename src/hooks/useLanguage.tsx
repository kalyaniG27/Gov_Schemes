import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, LanguageOption } from '../types';
import { loadTranslations } from '../utils/translations';

type LanguageContextType = {
  currentLanguage: Language;
  changeLanguage: (lang: Language) => Promise<void>;
  translate: (key: string) => string;
  isLoading: boolean;
  languages: LanguageOption[];
};

const defaultLanguages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const translate = (key: string): string => {
    return translations[key] || key;
  };

  const changeLanguage = async (language: Language) => {
    setIsLoading(true);
    try {
      const newTranslations = await loadTranslations(language);
      setTranslations(newTranslations);
      setCurrentLanguage(language);
      localStorage.setItem('preferred-language', language);
      document.documentElement.lang = language;
    } catch (error) {
      console.error('Failed to load translations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedLanguage = (localStorage.getItem('preferred-language') as Language) || (navigator.language.split('-')[0] as Language) || 'en';
    changeLanguage(savedLanguage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, translate, isLoading, languages: defaultLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};

export default useLanguage;
