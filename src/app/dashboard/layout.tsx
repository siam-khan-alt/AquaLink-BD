"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  X,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  Waves,
  DollarSign,
  BookOpen,
  MessageSquare,
  Users,
  TrendingUp,
  Settings,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const farmerNavItems: NavItem[] = [
  { label: "ওভারভিউ", href: "/dashboard/farmer", icon: <LayoutDashboard size={20} /> },
  { label: "পুকুর ও পানির গুণমান", href: "/dashboard/farmer/ponds", icon: <Waves size={20} /> },
  { label: "খরচ ট্র্যাকার", href: "/dashboard/farmer/expenses", icon: <DollarSign size={20} /> },
  { label: "লার্নিং হাব", href: "/dashboard/farmer/courses", icon: <BookOpen size={20} /> },
  { label: "মেসেজ", href: "/dashboard/chat", icon: <MessageSquare size={20} /> },
];

const adminNavItems: NavItem[] = [
  { label: "সিস্টেম ওভারভিউ", href: "/dashboard/admin", icon: <LayoutDashboard size={20} /> },
  { label: "চাষি তালিকা", href: "/dashboard/admin/users", icon: <Users size={20} /> },
  { label: "বাজার দর আপডেট", href: "/dashboard/admin/prices", icon: <TrendingUp size={20} /> },
  { label: "বুটক্যাম্প ব্যবস্থাপনা", href: "/dashboard/admin/courses", icon: <BookOpen size={20} /> },
  { label: "সাপোর্ট ইনবক্স", href: "/dashboard/chat", icon: <MessageSquare size={20} /> },
];

const mockNotifications = [
  { id: 1, message: "আজ পুকুর ১ এ চুন দেওয়ার দিন", time: "২ ঘন্টা আগে" },
  { id: 2, message: "পুকুর ২ এর pH মান স্বাভাবিক আছে", time: "৫ ঘন্টা আগে" },
  { id: 3, message: "নতুন কোর্স উপলব্ধ: মাছ চাষের আধুনিক কৌশল", time: "১ দিন আগে" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/login");
  };

  const navItems = session?.user?.role === "admin" ? adminNavItems : farmerNavItems;

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[var(--surface)] border-r border-[var(--border)] transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center">
                <Waves className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold text-[var(--text)] font-hind">
                মৎস্য বন্ধু
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
            >
              <X size={20} className="text-[var(--text)]" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-hind font-semibold",
                    isActive
                      ? "bg-[var(--primary)] text-white shadow-lg"
                      : "text-[var(--text)] hover:bg-[var(--border)]"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-3 px-4 py-3 bg-[var(--background)] rounded-xl border border-[var(--border)]">
              <div className="w-10 h-10 bg-[var(--primary)]/20 rounded-full flex items-center justify-center">
                <User size={20} className="text-[var(--primary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--text)] truncate font-hind">
                  {session?.user?.name || "ব্যবহারকারী"}
                </p>
                <p className="text-xs text-[var(--text)]/60 font-hind capitalize">
                  {session?.user?.role === "admin" ? "অ্যাডমিন" : "চাষি"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--border)]">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
              >
                <Menu size={24} className="text-[var(--text)]" />
              </button>
              <h1 className="text-lg font-bold text-[var(--text)] font-hind hidden sm:block">
                মৎস্য বন্ধু
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="relative p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
                >
                  <Bell size={22} className="text-[var(--text)]" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {/* Notification Dropdown */}
                {notificationOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setNotificationOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl z-50 overflow-hidden">
                      <div className="p-4 border-b border-[var(--border)]">
                        <h3 className="text-sm font-bold text-[var(--text)] font-hind">
                          নোটিফিকেশন
                        </h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {mockNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="p-4 border-b border-[var(--border)] hover:bg-[var(--border)] transition-colors cursor-pointer"
                          >
                            <p className="text-sm text-[var(--text)] font-hind">
                              {notification.message}
                            </p>
                            <p className="text-xs text-[var(--text)]/50 mt-1 font-hind">
                              {notification.time}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t border-[var(--border)]">
                        <button
                          onClick={() => setNotificationOpen(false)}
                          className="w-full text-center text-sm font-semibold text-[var(--primary)] hover:underline font-hind"
                        >
                          সব দেখুন
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
                >
                  <div className="w-9 h-9 bg-[var(--primary)]/20 rounded-full flex items-center justify-center">
                    <User size={18} className="text-[var(--primary)]" />
                  </div>
                  <ChevronDown size={16} className="text-[var(--text)]" />
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl z-50 overflow-hidden">
                      <div className="p-4 border-b border-[var(--border)]">
                        <p className="text-sm font-bold text-[var(--text)] font-hind">
                          {session?.user?.name || "ব্যবহারকারী"}
                        </p>
                        <p className="text-xs text-[var(--text)]/60 font-hind">
                          {session?.user?.email}
                        </p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--border)] rounded-lg transition-colors font-hind font-semibold"
                        >
                          <LogOut size={18} />
                          লগআউট
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
