"use client";

import { MessageSquareText, X } from "lucide-react";
import { useAIStore } from "@/shared/store/useUIStore";

export default function AIChatbotCTA() {
  const { isChatOpen, toggleChat } = useAIStore();

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-3">
      <button
        type="button"
        onClick={toggleChat}
        aria-label={isChatOpen ? "Close AI chat" : "Open AI chat"}
        className="h-14 w-14 rounded-2xl bg-[var(--primary)] text-[#020617] shadow-2xl shadow-cyan-500/20 border border-[var(--primary)]/30 flex items-center justify-center active:scale-95 transition-transform"
      >
        {isChatOpen ? <X size={22} /> : <MessageSquareText size={22} />}
      </button>
    </div>
  );
}

