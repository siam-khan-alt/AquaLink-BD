"use client";

import React from "react";
import Link from "next/link";
import { Camera, Sparkles, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";

export default function FishDiseaseVisionPreview() {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center">
            <Camera size={24} className="text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[var(--text)] font-hind">
              এআই মৎস্য রোগ নির্ণয় কেন্দ্র
            </h2>
            <div className="flex items-center gap-1 mt-1">
              <Sparkles size={14} className="text-[var(--primary)]" />
              <p className="text-xs text-[var(--primary)] font-semibold font-hind">
                জেমিনি মাল্টি-মোডাল এআই দ্বারা চালিত
              </p>
            </div>
          </div>
        </div>
        <p className="text-sm text-[var(--text)]/70 font-hind leading-relaxed">
          আপনার পুকুরের মাছের রোগ সনাক্ত করতে এখনই ছবি তুলুন। আমাদের উন্নত এআই প্রযুক্তি দ্রুত এবং নির্ভুলভাবে রোগ নির্ণয় করে সঠিক চিকিৎসার পরামর্শ প্রদান করবে।
        </p>
      </div>
      <Link href="/fish-diseases">
        <Button className="font-hind font-semibold">
          <Camera size={20} className="mr-2" />
          রোগ নির্ণয় শুরু করুন
          <ArrowRight size={20} className="ml-2" />
        </Button>
      </Link>
    </div>
  );
}
