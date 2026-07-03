import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../translations';

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  // Try to load language from localStorage, default to 'en'
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('language_pref') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language_pref', lang);
  }, [lang]);

  // Translation helper function
  const t = (key) => {
    const translationSet = translations[lang] || translations['en'];
    return translationSet[key] || translations['en'][key] || key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error('useLang must be used within a LangProvider');
  }
  return context;
};
