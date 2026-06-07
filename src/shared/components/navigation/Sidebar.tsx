"use client";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getNavigationByRole } from "@/config/dashboard-nav";
import { useUserRole } from "@/shared/hooks/useUserRole";
import { Waves, User, LogOut, Home, ChevronLeft, Menu, X } from "lucide-react";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = useUserRole();
  const navItems = role ? getNavigationByRole(role) : [];
  const profileHref = role ? `/dashboard/${role}/profile` : "/dashboard/farmer/profile";

  // Trace logging for debugging
  React.useEffect(() => {
    console.log("[Sidebar] Current role:", role, "Session role:", session?.user?.role);
  }, [role, session?.user?.role]);

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 bg-[var(--surface)] border-r flex flex-col transition-all duration-300 ease-in-out",
        sidebarOpen ? "lg:w-72" : "lg:w-20",
        mobileOpen ? "w-72 translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="text-[var(--primary)] shrink-0"><Waves size={28} /></div>
            {(sidebarOpen || mobileOpen) && <span className="font-bold text-xl whitespace-nowrap">মৎস্য বন্ধু</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:block p-2 hover:bg-[var(--border)] rounded-lg">
            {sidebarOpen ? <ChevronLeft /> : <Menu />}
          </button>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-2 hover:bg-[var(--border)] rounded-lg">
            <X />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className={cn("flex items-center gap-4 px-4 py-3 rounded-xl transition-all", 
                (sidebarOpen || mobileOpen) ? "justify-start" : "justify-center", 
                isActive ? "bg-[var(--primary)] text-white" : "text-[var(--text)] hover:bg-[var(--border)]")}>
                <Icon size={24} className="shrink-0" />
                {(sidebarOpen || mobileOpen) && <span className="whitespace-nowrap font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border)] space-y-2">
          <Link href="/" onClick={() => setMobileOpen(false)} className={cn("flex items-center gap-4 px-4 py-3 text-[var(--text)] hover:bg-[var(--border)] rounded-xl", (sidebarOpen || mobileOpen) ? "justify-start" : "justify-center")}>
             <Home size={24} /> {(sidebarOpen || mobileOpen) && "মূল ওয়েবসাইট"}
          </Link>
          {/* <Link href={profileHref} onClick={() => setMobileOpen(false)} className={cn("flex items-center gap-4 px-4 py-3 rounded-xl transition-all", (sidebarOpen || mobileOpen) ? "justify-start" : "justify-center", pathname === profileHref ? "bg-[var(--primary)] text-white" : "text-[var(--text)] hover:bg-[var(--border)]")}>
             <User size={24} /> {(sidebarOpen || mobileOpen) && "প্রোফাইল"}
          </Link> */}
          <button onClick={() => signOut({ callbackUrl: "/login" })} className={cn("w-full flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl", (sidebarOpen || mobileOpen) ? "justify-start" : "justify-center")}>
            <LogOut size={24} /> {(sidebarOpen || mobileOpen) && "লগআউট"}
          </button>
        </div>
      </aside>

      {!mobileOpen && (
        <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-[var(--surface)] border rounded-lg">
          <Menu />
        </button>
      )}
    </>
  );
}