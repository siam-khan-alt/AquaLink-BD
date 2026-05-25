"use client";

import React, { memo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, ArrowRight, Star, Zap, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Button, Chip } from "@heroui/react";

interface ICourse {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  price: number;
  category: string;
  createdAt: string;
}

interface ICoursesResponse {
  courses: ICourse[];
}

const formatBDT = (val: number): string => {
  if (val === 0) return "ফ্রি";
  return "৳" + new Intl.NumberFormat("bn-BD").format(val);
};

export const PremiumBootcampCTA = memo(() => {
  // কোর্স ডাটা ফেচিং (TanStack Query)
  const { data: coursesData, isLoading } = useQuery<ICoursesResponse>({
    queryKey: ["bootcamp-featured-courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("কোর্স লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
  });

  // ডাটা থেকে লেটেস্ট ৩টি কোর্স ফিল্টার
  const featuredCourses = coursesData?.courses?.slice(0, 3) ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Main Banner Hero container */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-[var(--hero-bg-start)] via-[var(--hero-bg-mid)] to-[var(--hero-bg-end)] border border-[var(--primary)]/20 p-6 md:p-10 rounded-3xl shadow-2xl">
        {/* Abstract Architectural Tech Shapes */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[var(--secondary)]/20 to-transparent rounded-full filter blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[var(--primary)]/30 to-transparent rounded-full filter blur-2xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          
          {/* Left Text and Details Column */}
          <div className="lg:col-span-3 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Chip
                size="sm"
                className="bg-white/10 backdrop-blur-md text-emerald-400 font-extrabold border border-white/10 font-hind px-3 py-1 flex items-center gap-1.5"
              >
                <Star size={12} className="fill-emerald-400 text-emerald-400" />
                <span>লাইভ বুটক্যাম্প</span>
              </Chip>
              <Chip
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold shadow-lg font-hind border-none px-3 py-1 flex items-center gap-1.5"
              >
                <Zap size={12} className="fill-current text-white" />
                <span>প্রিমিয়াম স্কিল</span>
              </Chip>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight font-hind">
              মাছ চাষের প্রফেশনাল গাইডলাইন ও প্রিমিয়াম প্রশিক্ষণ
            </h2>
            
            <p className="text-white/80 text-sm md:text-base font-normal max-w-xl font-hind leading-relaxed">
              আমাদের ডেডিকেটেড মডিউলে যোগ দিন এবং অভিজ্ঞ মৎস্য বিজ্ঞানীদের অধীনে আধুনিক চাষাবাদ শিখুন। 
              ভিডিও টিউটোরিয়াল, ইন্টারেক্টিভ কুইজ এবং লাইভ সাপোর্ট মেকানিজম সহ ক্যারিয়ারের নতুন দিগন্ত উন্মোচন করুন।
            </p>

            <div className="flex flex-wrap gap-4 text-white/90 font-medium text-xs md:text-sm pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/20 rounded-xl backdrop-blur-sm border border-white/5 font-hind">
                <GraduationCap size={16} className="text-[var(--secondary)]" />
                <span>মৎস্য বিশেষজ্ঞ নির্দেশনা</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/20 rounded-xl backdrop-blur-sm border border-white/5 font-hind">
                <Sparkles size={16} className="text-amber-400" />
                <span>ভ্যালিড সার্টিফিকেট</span>
              </div>
            </div>

            <div className="pt-4">
              <Link href="/dashboard/farmer/courses" passHref>
                <Button 
                  variant="ghost"
                  className="bg-white text-[var(--primary)] hover:bg-zinc-100 font-black font-hind text-sm px-8 h-12 rounded-xl shadow-xl transition-all transform-gpu hover:scale-[1.03] flex items-center gap-2 border-none"
                >
                  <span>সব বুটক্যাম্প দেখুন</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Live Courses Dynamic Area */}
          <div className="lg:col-span-2 w-full">
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-5 space-y-4">
              <h4 className="text-xs font-black tracking-wider text-white/60 uppercase font-hind flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                রানিং টপ কোর্সসমূহ
              </h4>

              <AnimatePresence mode="wait">
                {isLoading ? (
                  <div className="h-48 flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                    <p className="text-xs text-white/50 font-hind">লোডিং হচ্ছে...</p>
                  </div>
                ) : featuredCourses.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-center">
                    <p className="text-xs text-white/50 font-hind">কোনো অ্যাক্টিভ কোর্স পাওয়া যায়নি</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {featuredCourses.map((course) => (
                      <motion.div
                        layout
                        key={course._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl flex items-center justify-between gap-3 transition-colors group cursor-pointer"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate font-hind">
                            {course.title}
                          </p>
                          <p className="text-xs text-white/50 font-semibold font-hind mt-0.5">
                            {course.category}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-hind">
                            {formatBDT(course.price)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </Card>
    </div>
  );
});

PremiumBootcampCTA.displayName = "PremiumBootcampCTA";
export default PremiumBootcampCTA;