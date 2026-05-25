"use client";

import React, { memo, useState, useMemo, ChangeEvent } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useSession, signIn } from "next-auth/react";
import { BookOpen, Search, Video, Tag, ArrowRight, Loader2, X } from "lucide-react";
import { Card, Button, Input, Chip } from "@heroui/react";
import { toast } from "sonner";

interface ICourse {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  price: number;
  category: string;
  image?: string;
  createdAt: string;
}

interface ICoursesResponse {
  courses: ICourse[];
}

const formatBDT = (val: number): string => {
  if (val === 0) return "ফ্রি";
  return "৳ " + new Intl.NumberFormat("bn-BD").format(val);
};

export const PublicCoursesClient = memo(() => {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("সব");

  const { data: coursesData, isLoading } = useQuery<ICoursesResponse>({
    queryKey: ["public-courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("কোর্স ডাটা লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const courses = coursesData?.courses ?? [];

  const categories = useMemo(() => {
    return ["সব", ...Array.from(new Set(courses.map((c) => c.category)))];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "সব" || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchQuery, selectedCategory]);

  const handleEnrollment = async (courseId: string) => {
    if (!session) {
      toast.error("অনুগ্রহ করে কোর্সে অংশ নিতে প্রথমে লগইন করুন!");
      setTimeout(() => {
        signIn(undefined, { callbackUrl: `/dashboard/farmer/courses` });
      }, 1000);
      return;
    }
    toast.success("ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে...");
    window.location.assign(`/dashboard/farmer/courses`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4 transition-colors duration-300">
      <div className="container mx-auto max-w-6xl space-y-10">
        
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <Chip
            size="sm"
            className="bg-[var(--primary)]/10 text-[var(--primary)] font-black border border-[var(--primary)]/20 px-3 py-1 font-hind"
          >
            আমাদের অনলাইন লার্নিং প্ল্যাটফর্ম
          </Chip>
          <h1 className="text-3xl md:text-5xl font-black text-[var(--text)] tracking-tight font-hind leading-tight">
            আধুনিক মৎস্য চাষের <br />
            <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
              সেরা বুটক্যাম্প ও কোর্সসমূহ
            </span>
          </h1>
          <p className="text-sm md:text-base text-[var(--text)]/60 font-medium font-hind">
            যেকোনো স্থান থেকে মৎস্য বিশেষজ্ঞদের বৈজ্ঞানিক গাইডলাইন এবং আধুনিক চাষ পদ্ধতি শিখে নিজের খামারকে লাভজনক করুন।
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-[var(--surface)] border border-[var(--border)]/60 rounded-2xl shadow-xl transform-gpu">
          <div className="w-full md:w-80 relative flex items-center">
            <span className="absolute left-3 z-10 pointer-events-none">
              <Search size={18} className="text-[var(--text)]/40" />
            </span>
            <Input
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              placeholder="কোর্সের নাম বা কি-ওয়ার্ড খুঁজুন..."
              className="font-hind text-sm text-[var(--text)] w-full pl-10 pr-10" 
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 p-1 hover:bg-[var(--border)] rounded-full transition-colors z-10"
              >
                <X size={14} className="text-[var(--text)]/50" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-1.5 rounded-xl font-hind text-xs font-bold transition-all border ${
                  selectedCategory === category
                    ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md"
                    : "bg-[var(--background)] text-[var(--text)]/70 border-[var(--border)] hover:bg-[var(--border)]/50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-80 bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-center items-center">
                <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
              </Card>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-[var(--border)] bg-[var(--surface)]">
            <BookOpen size={48} className="text-[var(--text)]/20 mb-4" />
            <h3 className="text-lg font-bold text-[var(--text)] font-hind">কোনো কোর্স মিলল না</h3>
            <p className="text-sm text-[var(--text)]/50 mt-1 font-hind">
              আপনার সার্চ কিওয়ার্ড পরিবর্তন করে আবার চেষ্টা করুন।
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card 
                key={course._id} 
                className="bg-[var(--surface)] border border-[var(--border)]/70 hover:border-[var(--primary)]/30 hover:shadow-[0_20px_45px_rgba(15,106,107,0.08)] transition-all duration-300 flex flex-col h-full rounded-2xl transform-gpu overflow-hidden group"
              >
                <div className="relative w-full h-48 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 overflow-hidden">
                  <Image
                    src={course.image || "https://images.unsplash.com/photo-1535132011123-b6d36e2f6946?q=80&w=600&auto=format&fit=crop"} 
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={false}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 z-10 backdrop-blur-md bg-black/40 border border-white/10 px-2.5 py-1 rounded-xl flex items-center gap-1">
                    <Tag size={12} className="text-emerald-400" />
                    <span className="text-[11px] font-black text-white font-hind">
                      {course.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  
                  <h3 className="font-black text-lg text-[var(--text)] line-clamp-2 font-hind leading-snug group-hover:text-[var(--primary)] transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-sm text-[var(--text)]/70 line-clamp-3 font-hind leading-relaxed">
                    {course.description}
                  </p>

                  <div className="pt-4 border-t border-[var(--border)]/50 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[var(--text)]/40 font-bold font-hind block">কোর্স ফি</span>
                      <span className="text-xl font-black text-[var(--primary)] font-hind">
                        {formatBDT(course.price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[var(--text)]/50 bg-[var(--background)] px-2.5 py-1 rounded-lg border border-[var(--border)]">
                      <Video size={14} className="text-[var(--secondary)]" />
                      <span className="text-xs font-bold font-hind">রেকর্ডেড + লাইভ</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      fullWidth
                      onClick={() => handleEnrollment(course._id)}
                      className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/90 hover:from-[var(--secondary)] hover:to-[var(--secondary)] text-white font-black font-hind text-sm h-11 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 border-none"
                    >
                      <span>বুটক্যাম্পে অংশ নিন</span>
                      <ArrowRight size={16} />
                    </Button>
                  </div>

                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
});

PublicCoursesClient.displayName = "PublicCoursesClient";