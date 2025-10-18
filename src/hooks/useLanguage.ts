import { useState, useEffect } from 'react';
import { Language } from '../types';
import { loadTranslations } from '../utils/translations';

export const useLanguage = () => {
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
    const savedLanguage = localStorage.getItem('preferred-language') as Language | null;
    const browserLanguage = navigator.language.split('-')[0] as Language;
    const initialLanguage = savedLanguage || browserLanguage || 'en';
    
    changeLanguage(initialLanguage);
  }, []);
  
  return {
    currentLanguage,
    changeLanguage,
    translate,
    isLoading,
    languages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    ],
  };
};

export default useLanguage;