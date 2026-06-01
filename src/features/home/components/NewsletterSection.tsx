"use client";
import { useState } from "react";
import { Mail, Sparkles, Loader2 } from "lucide-react";
import { Card, Button, Input } from "@heroui/react";
import { toast } from "sonner";

export const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success("সফলভাবে সাবস্ক্রাইব করেছেন!");
        setEmail("");
      } else {
        toast.error("কিছু ভুল হয়েছে, আবার চেষ্টা করুন।");
      }
    } catch {
      toast.error("সার্ভার এরর!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container mx-auto pt-10">
      <Card className="relative overflow-hidden p-8 md:p-16 bg-[var(--hero-bg-mid)] rounded-3xl text-center text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[var(--secondary)]/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-white/10">
            <Sparkles size={14} className="text-[var(--secondary)]" /> সাপ্তাহিক আপডেট
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">সঠিক তথ্য, সফল চাষ।</h2>
          <p className="text-white/70 font-medium">মাছের বাজার দর ও আধুনিক চাষের ট্রেন্ড নিয়ে প্রতি সপ্তাহে আপনার ইনবক্সে সেরা টিপস পেতে আজই যুক্ত হোন।</p>
          
          <div className="flex flex-col sm:flex-row gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 mt-8">
            <div className="flex items-center px-4">
              <Mail size={18} className="text-white/50" />
            </div>
            <Input 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="আপনার ইমেইল ঠিকানা লিখুন" 
              className="flex-1 bg-transparent"
            />
            <Button 
              onPress={handleSubscribe} 
              isDisabled={loading} 
              className="bg-[var(--secondary)] text-[var(--text)] font-black rounded-xl h-12 px-8"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  জমা হচ্ছে...
                </>
              ) : (
                "সাবস্ক্রাইব করুন"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
};