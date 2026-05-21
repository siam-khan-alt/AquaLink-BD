"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Search } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    webkitSpeechRecognition?: { new (): SpeechRecognition };
  }
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  abort(): void;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export default function VoiceSearchGate() {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const supported = typeof window !== "undefined" && "webkitSpeechRecognition" in window;
    
    if (supported) {
      setTimeout(() => {
        setIsSpeechSupported(true);
      }, 0);

      const ctor = (window as Window).webkitSpeechRecognition;
      if (ctor) {
        const recognition = new ctor();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "bn-BD";

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          setIsListening(false);
        };
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
     toast.error("আপনার ব্রাউজার ভয়েস সার্চ সাপোর্ট করে না।");
      return;
    }

    if (isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSearch = () => {
    if (transcript.trim()) {
      window.location.href = `/market-prices?q=${encodeURIComponent(transcript)}`;
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-[var(--primary)]/10 rounded-xl">
          <Search className="text-[var(--primary)]" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-[var(--text)]">ভয়েস সার্চ</h3>
          <p className="text-xs font-bold text-[var(--text)]/50">কথা বলে খুঁজুন</p>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={toggleListening}
          disabled={!isSpeechSupported}
          className={`w-full h-16 rounded-xl flex items-center justify-center gap-3 font-bold transition-all ${
            isListening
              ? "bg-red-500 text-white animate-pulse"
              : "bg-[var(--primary)] text-[#020617] hover:scale-105 active:scale-95"
          } ${!isSpeechSupported ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isListening ? (
            <>
              <MicOff size={24} />
              <span>শুনছি...</span>
            </>
          ) : (
            <>
              <Mic size={24} />
              <span>মাইক চালু করুন</span>
            </>
          )}
        </button>

        {transcript && (
          <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)]">
            <p className="text-sm font-bold text-[var(--text)]/70 mb-2">আপনি বলেছেন:</p>
            <p className="text-lg font-black text-[var(--text)]">{transcript}</p>
            <button
              onClick={handleSearch}
              className="mt-3 w-full py-2 bg-[var(--primary)] text-[#020617] rounded-lg font-bold hover:scale-105 active:scale-95 transition-all"
            >
              খুঁজুন
            </button>
          </div>
        )}

        {!isSpeechSupported && (
          <p className="text-xs font-bold text-red-500 text-center">
            আপনার ব্রাউজার ভয়েস সার্চ সাপোর্ট করে না। Chrome ব্যবহার করুন।
          </p>
        )}
      </div>
    </div>
  );
}