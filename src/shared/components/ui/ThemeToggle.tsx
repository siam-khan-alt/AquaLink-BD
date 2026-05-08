"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--border)] hover:bg-[var(--background)] transition-all active:scale-90"
      aria-label="Toggle Theme"
    >
      <Sun 
        size={18} 
        className="text-yellow-400 transition-all scale-100 dark:scale-0 dark:absolute" 
      />

      <Moon 
        size={18} 
        className="text-[var(--primary)] transition-all scale-0 absolute dark:scale-100 dark:static" 
      />
      
      <span className="sr-only">Toggle Theme</span>
    </button>
  );
};