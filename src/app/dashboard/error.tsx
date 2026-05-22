"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 space-y-6 border border-red-200">
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle size={32} className="text-red-600" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-[var(--text)] font-hind">
            ড্যাশবোর্ড লোড করতে ব্যর্থ হয়েছে
          </h2>
          <p className="text-sm text-[var(--text)]/60 font-hind">
            দুঃখিত, ড্যাশবোর্ড লোড করার সময় একটি ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন বা হোম পেজে ফিরে যান।
          </p>
        </div>

        {error.message && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-800 font-hind">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={reset}
            className="flex-1 font-hind text-sm h-11 flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            আবার চেষ্টা করুন
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="flex-1 font-hind text-sm h-11 flex items-center justify-center gap-2"
          >
            <Home size={16} />
            হোম পেজ
          </Button>
        </div>
      </Card>
    </div>
  );
}
