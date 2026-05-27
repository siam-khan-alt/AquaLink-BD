"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowRight, Activity, Microscope } from "lucide-react";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";

const FishDiseaseVisionPreview = memo(() => {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full container mx-auto py-16"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10">
        
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-black uppercase tracking-widest">
            <Activity size={12} />
            AI Diagnostics Engine
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black text-[var(--text)] tracking-tighter leading-[1.1]">
            মাছের রোগ নির্ণয়ে <br/>
            <span className="text-[var(--primary)]">এআই প্রযুক্তির ছোঁয়া</span>
          </h2>
          
          <p className="text-base text-[var(--text)]/60 leading-relaxed max-w-lg font-medium">
            পুকুরের মাছের অস্বাভাবিক আচরণ বা শারীরিক পরিবর্তন দেখলেই আর দুশ্চিন্তা নয়। আমাদের এআই ক্যামেরা স্ক্যানার ব্যবহার করে দ্রুত নির্ভুল রোগ নির্ণয় করুন এবং তাৎক্ষণিক চিকিৎসাপত্র গ্রহণ করুন।
          </p>

          <div className="flex gap-4 pt-2">
            <Link href="/fish-diseases">
              <Button
                size="lg"
                className="bg-[var(--primary)] text-white font-black px-8 h-14 rounded-2xl hover:scale-105 transition-all shadow-lg shadow-[var(--primary)]/20"
              >
                {/* endContent এর বদলে সরাসরি চিলড্রেনের ভেতরে আইকন */}
                <span className="flex items-center gap-2">
                  এখনই শুরু করুন <ArrowRight size={18} />
                </span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative w-full lg:w-[400px] aspect-[4/3] bg-gradient-to-tr from-[var(--surface)] to-[var(--background)] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 flex flex-col justify-center items-center text-center overflow-hidden">
          <div className="absolute inset-0 bg-[var(--primary)]/5 opacity-50" />
          <div className="w-20 h-20 bg-[var(--surface)] rounded-2xl flex items-center justify-center mb-6 shadow-xl text-[var(--primary)]">
            <Microscope size={40} />
          </div>
          <h3 className="text-xl font-black text-[var(--text)] mb-2">স্মার্ট স্ক্যানিং</h3>
          <p className="text-xs text-[var(--text)]/50 max-w-[200px]">
            উন্নত ইমেজ প্রসেসিংয়ের মাধ্যমে মাছের ত্বকের রোগ সেকেন্ডেই শনাক্ত করুন।
          </p>
        </div>

      </div>
    </motion.section>
  );
});

FishDiseaseVisionPreview.displayName = "FishDiseaseVisionPreview";
export default FishDiseaseVisionPreview;