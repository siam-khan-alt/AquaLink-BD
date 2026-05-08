"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider 
      attribute="class"
      defaultTheme="light" 
      enableSystem
      disableTransitionOnChange
      enableColorScheme 
    >
      {children}
    </NextThemesProvider>
  );
}