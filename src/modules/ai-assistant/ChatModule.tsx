"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, User, Bot, Loader2, Fish } from "lucide-react";
import { useAIStore } from "@/shared/store/useUIStore";
import { IChatMessage } from "@/shared/types/ai.types";

export default function ChatModule(): React.JSX.Element | null {
  const { isChatOpen, toggleChat } = useAIStore();
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((): void => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSend = useCallback(async (text: string): Promise<void> => {
    if (!text.trim() || isTyping) return;
    
    const currentPrompt = text.trim();
    const userMsg: IChatMessage = { 
      id: crypto.randomUUID(), 
      role: "user", 
      text: currentPrompt, 
      timestamp: Date.now() 
    };

    // Prepare chat history for Gemini API context
    const chatHistory = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: currentPrompt,
          history: chatHistory 
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "FETCH_FAILED");
      }

      const data: { text: string } = await res.json();
      
      const aiMsg: IChatMessage = { 
        id: crypto.randomUUID(), 
        role: "model", 
        text: data.text, 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: unknown) {
      console.error("AI Assistant Error:", err instanceof Error ? err.message : "Unknown");
      // Optional: Push an error message to the UI
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, messages]);

  if (!isChatOpen) return null;

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 w-full sm:w-[450px] h-full sm:h-[650px] bg-[var(--background)] sm:rounded-2xl shadow-[0_30px_100px_-15px_rgba(0,0,0,0.3)] border border-[var(--border)] z-[100] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
      
      <header className="p-6 bg-[var(--primary)] text-[#020617] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-2xl animate-pulse">
             <Bot size={24} />
          </div>
          <div>
             <h3 className="font-black tracking-tight text-lg">মৎস্য বন্ধু AI</h3>
             <p className="text-[10px] uppercase font-bold opacity-70 tracking-widest">Active • Gemini 3 Flash</p>
          </div>
        </div>
        <button onClick={toggleChat} className="p-2 hover:bg-white/10 rounded-2xl transition-all">
          <X size={24} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-[var(--background)]">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
             <Fish size={60} className="mb-4 animate-bounce text-[var(--primary)]" />
             <p className="font-bold text-[var(--text)]">আপনার পুকুরের সমস্যাটি বলুন...</p>
          </div>
        )}
        
        {messages.map((m) => (
          <article key={m.id} className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
             <div className={`p-2 rounded-2xl shrink-0 ${m.role === 'user' ? 'bg-[var(--primary)] text-[#020617]' : 'bg-[var(--secondary)] text-[var(--primary)]'}`}>
                {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
             </div>
             <div className={`p-4 rounded-2xl text-sm font-semibold leading-relaxed max-w-[80%] ${
               m.role === 'user' ? 'bg-[var(--primary)] text-[#020617] rounded-tr-none' : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-tl-none'
             }`}>
                {m.text}
             </div>
          </article>
        ))}
        
        {isTyping && (
          <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-xs p-2">
            <Loader2 size={14} className="animate-spin" />
            মৎস্য বন্ধু উত্তর লিখছে...
          </div>
        )}
        <div ref={scrollRef} />
      </main>

      <footer className="p-6 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-3 bg-[var(--background)] p-2 rounded-2xl border border-[var(--border)] focus-within:ring-2 focus-within:ring-[var(--primary)]/30 transition-all">
           <input 
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
             placeholder="এখানে লিখুন..."
             className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-[var(--text)] p-3"
           />
           <button 
             onClick={() => handleSend(input)}
             disabled={isTyping || !input.trim()}
             className="p-3 bg-[var(--primary)] text-[#020617] rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
           >
              <Send size={20} />
           </button>
        </div>
      </footer>
    </div>
  );
}