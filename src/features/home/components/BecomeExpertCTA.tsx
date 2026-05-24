"use client";

import React from "react";
import Link from "next/link";
import { Stethoscope, ArrowRight, Award, Users } from "lucide-react";
import Card from "@/components/ui/Card";

export default function BecomeExpertCTA() {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 border border-[var(--primary)]/20 p-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[var(--primary)]/20 rounded-xl">
            <Stethoscope size={24} className="text-[var(--primary)]" />
          </div>
          <h2 className="text-2xl font-black text-[var(--text)] font-hind">
            বিশেষজ্ঞ হিসেবে যোগ দিন
          </h2>
        </div>

        <p className="text-[var(--text)]/80 font-hind mb-6">
          আপনি কি মৎস্য চাষের বিশেষজ্ঞ? আপনার দক্ষতা শেয়ার করুন এবং চাষিদের সহায়তা করুন। আমাদের প্ল্যাটফর্মে যোগ দিন এবং আয় করুন।
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
              <Award size={20} className="text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text)] font-hind">যাচাইকৃত বিশেষজ্ঞ</p>
              <p className="text-xs text-[var(--text)]/60 font-hind">পেশাদার পরিচয়</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
              <Users size={20} className="text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text)] font-hind">বিশাল নেটওয়ার্ক</p>
              <p className="text-xs text-[var(--text)]/60 font-hind">হাজার হাজার চাষি</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
              <Stethoscope size={20} className="text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text)] font-hind">আয়ের সুযোগ</p>
              <p className="text-xs text-[var(--text)]/60 font-hind">কনসালটেশন ফি</p>
            </div>
          </div>
        </div>

        <Link href="/apply-doctor">
          <button className="w-full md:w-auto bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white px-6 py-3 rounded-lg font-hind font-bold flex items-center justify-center gap-2 transition-colors">
            আবেদন করুন
            <ArrowRight size={20} />
          </button>
        </Link>
      </div>
    </Card>
  );
}
