"use client";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "@/shared/components/ui/ThemeToggle";
import NotificationDropdown from "@/shared/components/NotificationDropdown";

export default function Header() {
  const { data: session } = useSession();
  
  return (
    <header className="h-16 border-b flex items-center justify-end px-6 bg-[var(--surface)] gap-4">
       <div className="lg:hidden flex-1" />
       
       <ThemeToggle />
       <NotificationDropdown />
       <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold">
         {session?.user?.name?.charAt(0) || "U"}
       </div>
    </header>
  );
}