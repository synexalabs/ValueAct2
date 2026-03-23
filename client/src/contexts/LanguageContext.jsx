'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext({ language: 'de', setLanguage: () => {} });

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('de');

  useEffect(() => {
    const stored = localStorage.getItem('lang');
    if (stored === 'de' || stored === 'en') setLanguageState(stored);
  }, []);

  function setLanguage(lang) {
    setLanguageState(lang);
    localStorage.setItem('lang', lang);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
