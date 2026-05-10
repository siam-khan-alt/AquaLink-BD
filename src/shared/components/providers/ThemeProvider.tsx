"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
    <NextThemesProvider 
      attribute="class"
      defaultTheme="light" 
      enableSystem
      disableTransitionOnChange
      enableColorScheme 
    >
      {children}
    </NextThemesProvider>
    </SessionProvider>
  );
}