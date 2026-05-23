import { Home, BarChart2, Stethoscope, Mail, LogOut, User, LucideIcon, Waves, Info } from "lucide-react";

export interface NavLink {
  name: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_LINKS: NavLink[] = [
  { name: "মৎস্য বন্ধু", href: "/", icon: Home },
  { name: "বাজার দর", href: "/market-prices", icon: BarChart2 },
  { name: "রোগ সমাধান", href: "/fish-diseases", icon: Stethoscope },
  { name: "সম্পর্কে", href: "/about", icon: Info },
  { name: "যোগাযোগ", href: "/contact", icon: Mail },
] as const;

export const AUTH_LINKS = {
  login: { 
    name: "প্রবেশ করুন", 
    href: "/login", 
    icon: User 
  },
  dashboard: { 
    href: "/dashboard",
    icon: Waves,
    getName: (role?: string) => role === "admin" ? "কন্ট্রোল প্যানেল" : "আমার ফিশারি"
  },
  logout: {
    name: "বাহির হন", 
    href: "/logout",
    icon: LogOut 
  }
} as const;