"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Search } from "lucide-react";
import { toast } from "sonner";
import { Card, Button } from "@heroui/react";

declare global {
  interface Window {
    webkitSpeechRecognition?: { new (): SpeechRecognition };
    SpeechRecognition?: { new (): SpeechRecognition };
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
  resultIndex?: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export default function VoiceSearchGate() {
  const router = useRouter();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;

    const supported = typeof window !== "undefined" && 
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);
    
    if (supported) {
      setIsSpeechSupported(true);

      const ctor = (window as Window).webkitSpeechRecognition || (window as Window).SpeechRecognition;
      if (ctor) {
        const recognition = new ctor();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "bn-BD";

        recognition.onstart = () => {
          if (isMountedRef.current) {
            setIsListening(true);
            setInterimTranscript("");
          }
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          if (!isMountedRef.current) return;

          let finalTranscript = "";
          let interim = "";

          for (let i = event.resultIndex || 0; i < event.results.length; i++) {
            const result = event.results[i];
            const transcriptText = result[0].transcript;

            if (result.isFinal) {
              finalTranscript += transcriptText;
            } else {
              interim += transcriptText;
            }
          }

          if (finalTranscript) {
            setTranscript(finalTranscript);
            setInterimTranscript("");
          } else if (interim) {
            setInterimTranscript(interim);
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          if (!isMountedRef.current) return;

          setIsListening(false);
          setInterimTranscript("");

          switch (event.error) {
            case "not-allowed":
              toast.error("আপনার মাইক্রোফোন পারমিশন ব্লক করা আছে। দয়া করে ব্রাউজার সেটিংস চেক করুন।");
              break;
            case "network":
              toast.error("দুর্বল ইন্টারনেট সংযোগ! দয়া করে আবার চেষ্টা করুন।");
              break;
            case "no-speech":
              toast.error("কোনো শব্দ সনাক্ত করা যায়নি। দয়া করে মাইক অন করে স্পষ্ট করে বলুন।");
              break;
            case "aborted":
              // User manually stopped, no error needed
              break;
            default:
              toast.error(`ভয়েস রিকগনিশন এরর: ${event.error}`);
          }
        };

        recognition.onend = () => {
          if (isMountedRef.current) {
            setIsListening(false);
            setInterimTranscript("");
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      isMountedRef.current = false;
      
      if (recognitionRef.current) {
        // Nullify all event handlers to prevent memory leaks
        recognitionRef.current.onstart = () => {};
        recognitionRef.current.onresult = () => {};
        recognitionRef.current.onerror = () => {};
        recognitionRef.current.onend = () => {};
        
        // Abort the recognition
        recognitionRef.current.abort();
        recognitionRef.current = null;
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
      setInterimTranscript("");
    } else {
      setTranscript("");
      setInterimTranscript("");
      recognitionRef.current.start();
    }
  };

  const handleSearch = () => {
    const normalizedText = transcript.trim().toLowerCase();
    
    if (!normalizedText) {
      toast.error("দুঃখিত, আপনার অনুসন্ধানটি বুঝতে পারিনি। দয়া করে মাছের বাজার দর, রোগ বা সমাধান সংক্রান্ত বিষয়ে কথা বলুন।");
      return;
    }

    // Market prices keywords
    const marketPriceKeywords = ["দাম", "দর", "বাজার", "টাকা", "রেট", "কত"];
    const isMarketPrice = marketPriceKeywords.some(keyword => normalizedText.includes(keyword));

    // Fish diseases keywords
    const diseaseKeywords = ["রোগ", "সমাধান", "চিকিৎসা", "মরে", "ক্ষত", "ঘা", "ভাইরাস"];
    const isDisease = diseaseKeywords.some(keyword => normalizedText.includes(keyword));

    // Contact keywords
    const contactKeywords = ["যোগাযোগ", "হেল্প", "অফিস", "ফোন"];
    const isContact = contactKeywords.some(keyword => normalizedText.includes(keyword));

    if (isMarketPrice) {
      router.push(`/market-prices?q=${encodeURIComponent(transcript)}`);
    } else if (isDisease) {
      router.push(`/fish-diseases?q=${encodeURIComponent(transcript)}`);
    } else if (isContact) {
      router.push("/contact");
    } else {
      toast.error("দুঃখিত, আপনার অনুসন্ধানটি বুঝতে পারিনি। দয়া করে মাছের বাজার দর, রোগ বা সমাধান সংক্রান্ত বিষয়ে কথা বলুন।");
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.08] shadow-2xl rounded-2xl p-6">
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
        <Button
          onClick={toggleListening}
          isDisabled={!isSpeechSupported}
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
        </Button>

        {(transcript || interimTranscript) && (
          <div className="p-4 bg-[var(--background)]/40 rounded-xl border border-[var(--border)]/60">
            <p className="text-sm font-bold text-[var(--text)]/70 mb-2">
              {interimTranscript ? "শুনছি..." : "আপনি বলেছেন:"}
            </p>
            <p className="text-lg font-black text-[var(--text)]">
              {transcript || interimTranscript}
            </p>
            {transcript && (
              <Button
                onClick={handleSearch}
                className="mt-3 w-full py-2 bg-[var(--primary)] text-[#020617] rounded-lg font-bold hover:scale-105 active:scale-95 transition-all"
              >
                খুঁজুন
              </Button>
            )}
          </div>
        )}

        {!isSpeechSupported && (
          <p className="text-xs font-bold text-red-500 text-center">
            আপনার ব্রাউজার ভয়েস সার্চ সাপোর্ট করে না। Chrome ব্যবহার করুন।
          </p>
        )}
      </div>
    </Card>
  );
}