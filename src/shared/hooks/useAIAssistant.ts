"use client";

import { useState, useCallback } from "react";
import { IAIResponse, IChatMessage } from "../types/ai.types";

export const useAIAgent = () => {
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined") return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "bn-BD";
    window.speechSynthesis.speak(utterance);
  }, []);

  const processAI = async (text: string) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    const userMsg: IChatMessage = { id: Date.now().toString(), role: "user", text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ prompt: text }),
      });
      const data: IAIResponse = await res.json();
      
      if (data.text) {
        const aiMsg: IChatMessage = { id: (Date.now()+1).toString(), role: "model", text: data.text, timestamp: Date.now() };
        setMessages(prev => [...prev, aiMsg]);
        speak(data.text);
      }
    } catch (err) {
      console.error("AI Agent Error");
    } finally {
      setIsProcessing(false);
    }
  };

  return { messages, isProcessing, processAI, speak };
};