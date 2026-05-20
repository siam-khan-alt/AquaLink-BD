"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowBanner(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-banner-dismissed", "true");
  };

  if (!showBanner || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[400px] bg-[var(--surface)] border-2 border-[var(--primary)] rounded-2xl shadow-2xl z-50 p-4 animate-in slide-in-from-bottom-10 duration-500">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 hover:bg-[var(--background)] rounded-lg transition-colors"
      >
        <X size={18} className="text-[var(--text)]/50" />
      </button>

      <div className="flex items-start gap-4">
        <div className="p-3 bg-[var(--primary)]/10 rounded-xl shrink-0">
          <Smartphone className="text-[var(--primary)]" size={28} />
        </div>

        <div className="flex-1">
          <h4 className="text-lg font-black text-[var(--text)] mb-1">
            মৎস্য বন্ধু ইনস্টল করুন
          </h4>
          <p className="text-sm font-bold text-[var(--text)]/70 mb-3">
            অ্যাপ হিসেবে ইনস্টল করে দ্রুত ব্যবহার করুন
          </p>

          <button
            onClick={handleInstall}
            className="w-full py-3 bg-[var(--primary)] text-[#020617] rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all"
          >
            <Download size={18} />
            ইনস্টল করুন
          </button>
        </div>
      </div>
    </div>
  );
}
