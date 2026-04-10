"use client";

import { ThemeProvider } from "next-themes";
import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export default function Providers({ children }) {
  const [language, setLanguage] = useState("bn"); 
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "bn" ? "en" : "bn"));
  };

  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={true}>
      <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
        {children}
      </LanguageContext.Provider>
    </ThemeProvider>
  );
}