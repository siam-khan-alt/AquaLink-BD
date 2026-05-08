"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight } from "lucide-react";
import { NAV_LINKS, AUTH_LINKS } from "@/config/navigation";
import { ThemeToggle } from "../ui/ThemeToggle";
import { Logo } from "../ui/Logo";
import { Button } from "../ui/Button";

interface MobileMenuProps {
  isOpen: boolean;
  pathname: string;
  isLoggedIn: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  const handleLogout = (): void => {
    setIsLoggedIn(false);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Logo />

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href 
                    ? "bg-[var(--secondary)] text-[var(--primary)]" 
                    : "text-[var(--text)]/80 hover:bg-[var(--background)]"
                }`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <div className="hidden sm:flex items-center gap-2">
            {!isLoggedIn ? (
              <Link href={AUTH_LINKS.login.href}>
                <Button variant="primary">
                  <AUTH_LINKS.login.icon size={18} />
                  <span>{AUTH_LINKS.login.name}</span>
                </Button>
              </Link>
            ) : (
              <>
                <Link href={AUTH_LINKS.dashboard.href}>
                  <Button variant="secondary">
                    <AUTH_LINKS.dashboard.icon size={18} />
                    <span>{AUTH_LINKS.dashboard.name}</span>
                  </Button>
                </Link>
                <Button variant="ghost" onClick={handleLogout} className="text-red-500">
                  <AUTH_LINKS.logout.icon size={18} />
                </Button>
              </>
            )}
          </div>

          <button 
            className="md:hidden p-2.5 rounded-xl bg-[var(--primary)] text-white active:scale-95 transition-transform" 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <MobileMenu 
        isOpen={isOpen} 
        pathname={pathname} 
        isLoggedIn={isLoggedIn} 
        onClose={() => setIsOpen(false)} 
        onLogout={handleLogout} 
      />
    </nav>
  );
}

const MobileMenu = ({ isOpen, pathname, isLoggedIn, onClose, onLogout }: MobileMenuProps) => (
  <div className={`md:hidden absolute w-full bg-[var(--surface)] transition-all duration-300 ease-in-out shadow-xl ${
    isOpen ? "min-h-screen border-b border-[var(--border)] opacity-100" : "h-0 opacity-0 overflow-hidden"
  }`}>
    <div className="p-4 flex flex-col gap-2">
      {NAV_LINKS.map((link) => (
        <Link 
          key={link.href} 
          href={link.href} 
          onClick={onClose}
          className={`flex justify-between items-center p-4 rounded-2xl font-bold transition-all ${
            pathname === link.href ? "bg-[var(--secondary)] text-[var(--primary)]" : "hover:bg-[var(--background)]"
          }`}
        >
          <div className="flex items-center gap-3">
            <link.icon size={20} />
            <span>{link.name}</span>
          </div>
          <ChevronRight size={18} className="opacity-30" />
        </Link>
      ))}

      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        {!isLoggedIn ? (
          <Link href={AUTH_LINKS.login.href} onClick={onClose}>
            <Button variant="primary" className="w-full py-4 text-lg">
              <AUTH_LINKS.login.icon size={20} />
              <span>{AUTH_LINKS.login.name}</span>
            </Button>
          </Link>
        ) : (
          <div className="flex flex-col gap-3">
            <Link href={AUTH_LINKS.dashboard.href} onClick={onClose}>
              <Button variant="secondary" className="w-full py-4 text-lg">
                <AUTH_LINKS.dashboard.icon size={20} />
                <span>{AUTH_LINKS.dashboard.name}</span>
              </Button>
            </Link>
            <Button variant="ghost" onClick={onLogout} className="w-full py-4 text-red-500">
              <AUTH_LINKS.logout.icon size={20} />
              <span>{AUTH_LINKS.logout.name}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  </div>
);