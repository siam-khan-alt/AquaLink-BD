"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Bell, User, LogOut, Waves, ChevronDown, Menu, X,
  LayoutDashboard, Users, FileText, UserCheck, AlertTriangle, TrendingUp, BookOpen, MessageSquare, DollarSign, Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";
import ErrorBoundary from "@/components/ErrorBoundary";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  createdAt: Date;
}

const farmerNavItems: NavItem[] = [
  { label: "ওভারভিউ", href: "/dashboard/farmer", icon: <LayoutDashboard size={20} /> },
  { label: "পুকুর ও পানির গুণমান", href: "/dashboard/farmer/ponds", icon: <Waves size={20} /> },
  { label: "খরচ ট্র্যাকার", href: "/dashboard/farmer/expenses", icon: <DollarSign size={20} /> },
  { label: "স্মার্ট ফিড ক্যালকুলেটর", href: "/dashboard/farmer/feed-calculator", icon: <Calculator size={20} /> },
  { label: "ラーニング ハブ", href: "/dashboard/farmer/courses", icon: <BookOpen size={20} /> },
  { label: "মেসেজ", href: "/dashboard/chat", icon: <MessageSquare size={20} /> },
];

const adminNavItems: NavItem[] = [
  { label: "সিস্টেম ওভারভিউ", href: "/dashboard/admin", icon: <LayoutDashboard size={20} /> },
  { label: "চাষি তালিকা", href: "/dashboard/admin/users", icon: <Users size={20} /> },
  { label: "চাষি গল্প ব্যবস্থাপনা", href: "/dashboard/admin/stories", icon: <FileText size={20} /> },
  { label: "বিশেষজ্ঞ ব্যবস্থাপনা", href: "/dashboard/admin/experts", icon: <UserCheck size={20} /> },
  { label: "জরুরি সতর্কতা", href: "/dashboard/admin/alerts", icon: <AlertTriangle size={20} /> },
  { label: "বাজার দর আপডেট", href: "/dashboard/admin/prices", icon: <TrendingUp size={20} /> },
  { label: "বুটক্যাম্প ব্যবস্থাপনা", href: "/dashboard/admin/courses", icon: <BookOpen size={20} /> },
  { label: "সাপোর্ট ইনবক্স", href: "/dashboard/chat", icon: <MessageSquare size={20} /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("নোটিফিকেশন লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (!res.ok) throw new Error("নোটিফিকেশন পড়া হিসেবে চিহ্নিত করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

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
    <div className="flex h-screen overflow-hidden bg-[var(--background)] relative">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Component */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-[var(--surface)] border-r border-[var(--border)]/60 flex flex-col z-50 transition-transform duration-300 lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo and Close button for Mobile */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)} aria-label="মৎস্য বন্ধু ড্যাশবোর্ড">
            <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center">
              <Waves className="text-white" size={24} aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-[var(--text)] font-hind">মৎস্য বন্ধু</span>
          </Link>
          <button className="lg:hidden p-2 text-[var(--text)]/80" onClick={() => setSidebarOpen(false)} aria-label="সাইডবার বন্ধ করুন">
            <X size={22} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2" aria-label="ড্যাশবোর্ড নেভিগেশন">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-hind font-semibold",
                  isActive ? "bg-[var(--primary)] text-white shadow-lg" : "text-[var(--text)] hover:bg-[var(--border)]"
                )}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        {/* Public Home Page Link */}
        <div className="px-4 mb-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-all duration-200 font-hind font-semibold border border-dashed border-[var(--border)]"
            aria-label="মূল ওয়েবসাইটে যান"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>মূল ওয়েবসাইট</span>
          </Link>
        </div>

        {/* User Footer Profile Card */}
        <div className="p-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 px-4 py-3 bg-[var(--background)] rounded-xl border border-[var(--border)]">
            <div className="w-10 h-10 bg-[var(--primary)]/20 rounded-full flex items-center justify-center">
              <User size={20} className="text-[var(--primary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--text)] truncate font-hind">{session?.user?.name || "ব্যবহারকারী"}</p>
              <p className="text-xs text-[var(--text)]/60 font-hind capitalize">{session?.user?.role === "admin" ? "অ্যাডমিন" : "চাষি"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Viewport Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Responsive Navbar/Header */}
        <header className="bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--border)] sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            
            {/* Mobile Hamburger Trigger */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors lg:hidden text-[var(--text)]"
              aria-label="সাইডবার খুলুন"
            >
              <Menu size={24} />
            </button>

            <h1 className="text-base lg:text-lg font-bold text-[var(--text)] font-hind">
              মৎস্য বন্ধু ড্যাশবোর্ড
            </h1>

            {/* Profile Dropdown actions */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="relative p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
                  aria-label="নোটিফিকেশন"
                  aria-expanded={notificationOpen}
                >
                  <Bell size={22} className="text-[var(--text)]" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
                </button>

                {/* Notification Dropdown */}
                {notificationOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setNotificationOpen(false)}
                    />
                    <div className="absolute max-sm:fixed max-sm:top-16 max-sm:left-4 max-sm:right-4 right-0 mt-2 sm:w-80 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl z-50 overflow-hidden transition-all duration-200" role="dialog" aria-label="নোটিফিকেশন">
                      <div className="p-4 border-b border-[var(--border)]">
                        <h3 className="text-sm font-bold text-[var(--text)] font-hind">
                          নোটিফিকেশন
                        </h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notificationsData?.notifications && notificationsData.notifications.length > 0 ? (
                          notificationsData.notifications.map((notification: Notification) => (
                            <div
                              key={notification._id}
                              className="p-4 border-b border-[var(--border)] hover:bg-[var(--border)] transition-colors cursor-pointer"
                            >
                              <p className="text-sm text-[var(--text)] font-hind">
                                {notification.title}
                              </p>
                              <p className="text-xs text-[var(--text)]/60 mt-1 font-hind">
                                {notification.message}
                              </p>
                              <p className="text-xs text-[var(--text)]/40 mt-1 font-hind">
                                {new Date(notification.createdAt).toLocaleString("bn-BD")}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <p className="text-sm text-[var(--text)]/60 font-hind">
                              কোনো নতুন নোটিফিকেশন নেই
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="p-3 border-t border-[var(--border)]">
                        <button
                          onClick={() => {
                            markAsReadMutation.mutate();
                            setNotificationOpen(false);
                          }}
                          className="w-full text-center text-sm font-semibold text-[var(--primary)] hover:underline font-hind"
                        >
                          সব পড়া হিসেবে চিহ্নিত করুন
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
                  aria-label="প্রোফাইল মেনু"
                  aria-expanded={profileOpen}
                >
                  <div className="w-9 h-9 bg-[var(--primary)]/20 rounded-full flex items-center justify-center">
                    <User size={18} className="text-[var(--primary)]" aria-hidden="true" />
                  </div>
                  <ChevronDown size={16} className="text-[var(--text)]" aria-hidden="true" />
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl z-50 overflow-hidden" role="menu" aria-label="প্রোফাইল মেনু">
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
                          role="menuitem"
                        >
                          <LogOut size={18} aria-hidden="true" />
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

        {/* Dashboard Dynamic Page Render Screen */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
