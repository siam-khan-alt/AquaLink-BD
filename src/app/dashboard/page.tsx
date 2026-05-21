"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function DashboardRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    const role = session.user?.role;
    if (role === "admin") {
      router.push("/dashboard/admin");
    } else {
      router.push("/dashboard/farmer");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
        <p className="text-[var(--text)] font-semibold font-hind opacity-80">
          অপেক্ষা করুন, আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...
        </p>
      </div>
    </div>
  );
}
