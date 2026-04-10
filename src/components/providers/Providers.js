"use client";

import { ThemeProvider } from "next-themes";
import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext({
  language: "bn",
  toggleLanguage: () => {},
  setLanguage: () => {}
});

export const useLanguage = () => useContext(LanguageContext);

export default function Providers({ children }) {
  const [language, setLanguage] = useState("bn");
  const [mounted, setMounted] = useState(false);

   useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "bn" ? "en" : "bn"));
  };


  return (
   <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      <ThemeProvider 
        attribute="data-theme" 
        defaultTheme="light" 
        enableSystem={false}
        disableTransitionOnChange 
      >
        <div style={{ visibility: mounted ? "visible" : "hidden" }}>
           {children}
        </div>
      </ThemeProvider>
    </LanguageContext.Provider>
  );
}