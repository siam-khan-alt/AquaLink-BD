"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, Star, Zap } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function PremiumBootcampCTA() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 border border-[var(--primary)] p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full">
              <Star size={14} className="text-white fill-white" />
              <span className="text-xs font-bold text-white font-hind">
                নতুন
              </span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full">
              <Zap size={14} className="text-white" />
              <span className="text-xs font-bold text-white font-hind">
                প্রিমিয়াম
              </span>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-white mb-3 font-hind">
            মাছ চাষের আধুনিক কৌশল শিখুন
          </h2>
          <p className="text-white/90 text-sm md:text-base mb-6 max-w-2xl font-hind">
            আমাদের প্রিমিয়াম বুটক্যাম্পে যোগ দিন এবং বিশেষজ্ঞদের থেকে মাছ চাষের আধুনিক কৌশল শিখুন।
            ভিডিও টিউটোরিয়াল, লাইভ সেশন এবং সার্টিফিকেট সহ সম্পূর্ণ প্রশিক্ষণ।
          </p>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <GraduationCap size={18} className="text-white/80" />
              <span className="text-sm text-white/90 font-hind">বিশেষজ্ঞ নির্দেশনা</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={18} className="text-white/80" />
              <span className="text-sm text-white/90 font-hind">সার্টিফিকেট প্রদান</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-white/80" />
              <span className="text-sm text-white/90 font-hind">লাইভ সেশন</span>
            </div>
          </div>

          <Link href="/dashboard/farmer/courses">
            <Button className="bg-white text-[var(--primary)] hover:bg-white/90 h-12 px-8 font-hind text-sm font-bold shadow-lg hover:scale-105 transition-all">
              <span>বুটক্যাম্প দেখুন</span>
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
