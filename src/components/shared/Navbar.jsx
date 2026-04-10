"use client";
import LinkNext from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useLanguage } from "@/components/providers/Providers";
import { Sun, Moon, Languages, User, ChevronRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const navLinks = [
    { name: language === "bn" ? "হোম" : "Home", href: "/" },
    { name: language === "bn" ? "বাজার" : "Market", href: "/products" },
    { name: language === "bn" ? "বিশেষজ্ঞ" : "Experts", href: "/experts" },
    { name: language === "bn" ? "ভাড়া" : "Rentals", href: "/pond-rentals" },
    { name: language === "bn" ? "যোগাযোগ" : "Contact", href: "/contact" },
  ];

  if (!mounted) return null;

  return (
    <nav className="fixed top-0 w-full z-50 transition-all bg-[var(--surface)] border-b border-[var(--border)]">
      <div className="container mx-auto px-4 md:px-6 ">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <LinkNext href="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative w-9 h-9">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                width={36} 
                height={36} 
                priority
                className="object-contain"
              />
            </div>
            <span className="text-lg sm:text-xl font-black brand-text tracking-tighter">
              {language === "bn" ? "আকুয়ালিংক বিডি" : "AquaLink BD"}
            </span>
          </LinkNext>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link, index) => (
              <div key={link.href} className="flex items-center">
                <LinkNext
                  href={link.href}
                  className={`nav-link ${
                    pathname === link.href 
                      ? "active-link" 
                      : "text-[var(--text)] opacity-70 hover:opacity-100"
                  }`}
                >
                  {link.name}
                </LinkNext>
                {index < navLinks.length - 1 && (
                  <ChevronRight size={14} className="mx-1 font-bold text-[var(--primary)] opacity-30" />
                )}
              </div>
            ))}
          </div>

          {/* Right Actions & Toggle */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={toggleLanguage} className="p-2 hover:bg-[var(--secondary)] rounded-xl transition-all">
              <Languages size={18} className="text-[var(--primary)]" />
            </button>

            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 hover:bg-[var(--secondary)] rounded-xl transition-all">
              {theme === "dark" ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-[var(--primary)]" />}
            </button>

            {/* Desktop Login Button */}
            <LinkNext href="/login" className="hidden sm:flex items-center gap-2 px-5 py-2 bg-[var(--primary)] text-white rounded-full font-bold hover:scale-105 active:scale-95 transition-all text-xs shadow-lg shadow-cyan-500/30">
              <User size={14} />
              {language === "bn" ? "লগইন" : "Login"}
            </LinkNext>

            {/* Mobile Hamburger Toggle Button */}
            <button 
              className="md:hidden flex items-center justify-center p-2 w-10 h-10 rounded-xl bg-[var(--secondary)] text-[var(--primary)] transition-all active:scale-90" 
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-[var(--surface)] border-b border-[var(--border)] ${isOpen ? "max-h-[500px] py-4 shadow-2xl" : "max-h-0"}`}>
        <div className="flex flex-col gap-1 px-4">
          {navLinks.map((link) => (
            <LinkNext
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`flex justify-between items-center px-4 py-3 rounded-xl font-bold transition-all ${
                pathname === link.href 
                  ? "bg-[var(--secondary)] text-[var(--primary)]" 
                  : "text-[var(--text)] opacity-80 hover:bg-[var(--background)]"
              }`}
            >
              {link.name}
              <ChevronRight size={16} className={pathname === link.href ? "opacity-100" : "opacity-30"} />
            </LinkNext>
          ))}
          
          <LinkNext 
            href="/login" 
            className="mt-4 flex sm:hidden items-center justify-center gap-2 w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold shadow-lg"
            onClick={() => setIsOpen(false)}
          >
            <User size={18} />
            {language === "bn" ? "লগইন করুন" : "Login Now"}
          </LinkNext>
        </div>
      </div>
    </nav>
  );
}