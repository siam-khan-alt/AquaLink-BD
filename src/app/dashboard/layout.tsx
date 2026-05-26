"use client";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DASHBOARD_NAV } from "@/config/dashboard-nav";
import { 
  Menu, X, Waves, User, Bell, LogOut, Home, ChevronLeft 
} from "lucide-react";
import { ThemeToggle } from "@/shared/components/ui/ThemeToggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const role = session?.user?.role || "farmer";
  const navItems = DASHBOARD_NAV[role as keyof typeof DASHBOARD_NAV] || DASHBOARD_NAV.farmer;
  
  // প্রোফাইল রুটের পাথ
  const profileHref = `/dashboard/${role}/profile`;

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden">
      <aside className={cn(
        "bg-[var(--surface)] border-r z-50 flex flex-col transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-72" : "w-20"
      )}>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 overflow-hidden shrink-0">
          <div className="text-[var(--primary)] shrink-0"><Waves size={28} /></div>
          {sidebarOpen && <span className="font-bold text-xl whitespace-nowrap">মৎস্য বন্ধু</span>}
        </div>
        
        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} title={!sidebarOpen ? item.label : ""}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all", 
                  sidebarOpen ? "justify-start" : "justify-center",
                  isActive ? "bg-[var(--primary)] text-white" : "text-[var(--text)] hover:bg-[var(--border)]"
                )}
              >
                <Icon size={24} className="shrink-0" />
                {sidebarOpen && <span className="whitespace-nowrap font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] shrink-0 space-y-2">
          <Link href="/" title="মূল ওয়েবসাইট" className={cn("flex items-center gap-4 px-4 py-3 text-[var(--text)] hover:bg-[var(--border)] rounded-xl", sidebarOpen ? "justify-start" : "justify-center")}>
             <Home size={24} /> {sidebarOpen && "মূল ওয়েবসাইট"}
          </Link>
          
          <Link href={profileHref} title="প্রোফাইল" className={cn("flex items-center gap-4 px-4 py-3 rounded-xl transition-all", sidebarOpen ? "justify-start" : "justify-center", pathname === profileHref ? "bg-[var(--primary)] text-white" : "text-[var(--text)] hover:bg-[var(--border)]")}>
             <User size={24} /> {sidebarOpen && "প্রোফাইল"}
          </Link>

          <button onClick={() => signOut({ callbackUrl: "/login" })} title="লগআউট" className={cn("w-full flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl", sidebarOpen ? "justify-start" : "justify-center")}>
            <LogOut size={24} /> {sidebarOpen && "লগআউট"}
          </button>
        </div>
      </aside>

      {/* Header */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b flex items-center justify-between px-6 bg-[var(--surface)]">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-[var(--border)] rounded-lg">
            {sidebarOpen ? <ChevronLeft /> : <Menu />}
          </button>
          <div className="flex items-center gap-4">
             <ThemeToggle />
             <Bell size={20} />
             <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold">
               {session?.user?.name?.charAt(0) || "U"}
             </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}