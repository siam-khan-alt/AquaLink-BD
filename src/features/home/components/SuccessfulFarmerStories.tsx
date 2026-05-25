"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Play, BookOpen, TrendingUp, Award, Users, AlertCircle } from "lucide-react";
import Image from "next/image";
import { Card, CardFooter, Button, Chip } from "@heroui/react";

interface Story {
  _id: string;
  farmerName: string;
  location: string;
  title: string;
  description: string;
  thumbnail: string;
  achievement: string;
  contentType: "video" | "text";
  videoUrl?: string;
  createdAt: string;
}

interface IStoriesResponse {
  stories?: Story[];
}

// Client-side fetch API
async function getStories(): Promise<Story[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/home/stories`, {
      next: { revalidate: 300 }, // ৫ মিনিট সিডিএন ক্যাশ
    });

    if (!res.ok) return [];
    const data = (await res.json()) as IStoriesResponse;
    return data.stories || [];
  } catch (error) {
    console.error("Error fetching farmer stories:", error);
    return [];
  }
}

export default function SuccessfulFarmerStories() {
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [activeBigVideo, setActiveBigVideo] = useState<Story | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    getStories().then((data) => {
      if (isMounted) {
        setAllStories(data);
        
        // প্রথম যে ভিডিও স্টোরিটি পাওয়া যাবে, সেটিকে ডিফল্ট বড় স্পটে রাখা হবে
        const firstVideo = data.find((story) => story.contentType === "video");
        if (firstVideo) {
          setActiveBigVideo(firstVideo);
        }
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // UseMemo Filtering
  const videoStories = useMemo(() => {
    return allStories.filter((story) => story.contentType === "video").slice(0, 4);
  }, [allStories]);

  const textStories = useMemo(() => {
    return allStories.filter((story) => story.contentType === "text").slice(0, 2);
  }, [allStories]);

  // নিচের ৩টি ছোট ভিডিও যা বর্তমানে বড় একটিভ স্পটে নেই
  const bottomVideos = useMemo(() => {
    if (!activeBigVideo) return videoStories.slice(0, 3);
    return videoStories.filter((v) => v._id !== activeBigVideo._id).slice(0, 3);
  }, [videoStories, activeBigVideo]);

  const handleVideoSelect = (story: Story) => {
    setActiveBigVideo(story);
    setIsPlaying(false);
  };

  if (isLoading) {
    return (
      <section className="space-y-8 container mx-auto px-4 py-8">
        <div className="h-10 w-64 bg-[var(--surface)] rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 aspect-video bg-[var(--surface)] rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-32 bg-[var(--surface)] rounded-2xl animate-pulse" />
            <div className="h-32 bg-[var(--surface)] rounded-2xl animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  // ডাটা না থাকলে স্ক্রিন ব্ল্যাঙ্ক না রেখে এলার্ট মেসেজ দেখাবে (ESLint Error Fixed)
  if (videoStories.length === 0 && textStories.length === 0) {
    return (
      <section className="container mx-auto px-4 py-12 text-center border border-dashed border-[var(--border)] rounded-2xl bg-[var(--surface)]/30">
        <AlertCircle className="mx-auto text-amber-500 mb-3" size={40} />
        <h3 className="text-lg font-bold font-hind text-[var(--text)]">কোনো চাষি স্টোরি পাওয়া যায়নি</h3>
        <p className="text-sm font-hind text-[var(--text)]/60 max-w-md mx-auto mt-1">
          ডাটাবেজে কোনো গল্প নেই অথবা এপিআই রেসপন্স খালি আসছে। দয়া করে অ্যাডমিন প্যানেল থেকে গল্প যুক্ত করুন এবং contentType (&quot;video&quot;/&quot;text&quot;) চেক করুন।
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-8 container mx-auto px-4 py-8">
      {/* Section Header */}
      <div className="flex items-end justify-between border-b border-[var(--border)]/40 pb-4">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-black text-[var(--text)] tracking-tighter font-hind">
            সফল চাষিদের <span className="text-[var(--primary)]">অনুপ্রেরণামূলক গল্প</span>
          </h2>
          <p className="text-sm md:text-base font-medium text-[var(--text)]/60 font-hind">
            বাস্তব জীবনের সফলতা থেকে আধুনিক চাষাবাদের আইডিয়া এবং সঠিক দিকনির্দেশনা খুঁজুন।
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[var(--primary)] bg-[var(--primary)]/10 px-4 py-2 rounded-xl border border-[var(--primary)]/20">
          <Users size={18} />
          <span className="text-xs font-black tracking-wider font-hind">৫০০+ সফল চাষি</span>
        </div>
      </div>

      {/* Main Container Layer */}
      <div className="space-y-6">
        
        {/* TOP LAYOUT: 1 Big Active Video + 2 Side Text Stories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Big Featured Active Video / Player */}
          {activeBigVideo && (
            <div className="lg:col-span-2">
              <Card className="relative aspect-video w-full rounded-2xl overflow-hidden group border border-[var(--border)]/40 bg-black shadow-xl">
                {isPlaying && activeBigVideo.videoUrl ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${activeBigVideo.videoUrl}?autoplay=1`}
                    title={activeBigVideo.title}
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <>
                    {activeBigVideo.thumbnail && (
                      <Image
                        src={activeBigVideo.thumbnail}
                        alt={activeBigVideo.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-700 brightness-[0.85] group-hover:scale-[1.02]"
                        priority
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent z-10" />

                    {/* Main Premium Glass Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <button
                        type="button"
                        onClick={() => setIsPlaying(true)}
                        className="w-16 h-16 bg-[var(--primary)] text-black rounded-full flex items-center justify-center scale-105 shadow-[0_0_30px_rgba(15,106,107,0.5)] hover:scale-110 transition-transform duration-300 cursor-pointer focus:outline-none"
                      >
                        <Play size={26} className="fill-current ml-1" />
                      </button>
                    </div>

                    <div className="absolute top-4 left-4 z-20">
                      <Chip size="sm" className="bg-[var(--primary)] text-black font-black font-hind px-2">চলমান ভিডিও</Chip>
                    </div>

                    {/* Active Big Video Meta */}
                    <CardFooter className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-transparent border-none flex flex-col items-start space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-[var(--primary)]" />
                        <span className="text-sm font-bold text-white font-hind">{activeBigVideo.farmerName} • {activeBigVideo.location}</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white font-hind text-left leading-tight">
                        {activeBigVideo.title}
                      </h3>
                      <p className="text-xs md:text-sm text-white/70 font-hind line-clamp-2 text-left max-w-2xl">
                        {activeBigVideo.description}
                      </p>
                      <div className="flex items-center gap-2 text-emerald-400 pt-1">
                        <TrendingUp size={16} />
                        <span className="text-xs font-black font-hind tracking-wider">{activeBigVideo.achievement}</span>
                      </div>
                    </CardFooter>
                  </>
                )}
              </Card>
            </div>
          )}

          {/* Right Side: 2 Text Stories */}
          <div className="flex flex-col justify-between gap-4 h-full">
            {textStories.map((story, idx) => (
              <Card 
                key={story._id || `text-${idx}`}
                className="relative flex-1 bg-[var(--surface)] border border-[var(--border)]/50 p-5 rounded-2xl hover:border-[var(--primary)]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between text-left"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] font-hind bg-[var(--primary)]/10 px-2.5 py-1 rounded-md">
                      <BookOpen size={12} /> নিবন্ধ স্টোরি
                    </span>
                    <span className="text-[11px] font-medium text-[var(--text)]/40 font-hind">{story.location}</span>
                  </div>
                  <h4 className="text-base font-black text-[var(--text)] font-hind line-clamp-2 leading-snug">
                    {story.title}
                  </h4>
                  <p className="text-xs text-[var(--text)]/60 font-hind line-clamp-2">
                    {story.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]/40 mt-3">
                  <span className="text-xs font-bold text-emerald-500 font-hind flex items-center gap-1">
                    <TrendingUp size={13} /> {story.achievement}
                  </span>
                  <Button size="sm" variant="outline" className="h-7 px-3 text-xs font-bold font-hind rounded-lg text-[var(--primary)] bg-[var(--primary)]/10 border-none">
                    গল্পটি পড়ুন
                  </Button>
                </div>
              </Card>
            ))}
          </div>

        </div>

        {/* BOTTOM LAYOUT: 3 Remaining Video Items (Swappers) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bottomVideos.map((story, index) => (
            <div
              key={story._id || `bottom-vid-${index}`}
              onClick={() => handleVideoSelect(story)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') handleVideoSelect(story); }}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden group border border-[var(--border)]/40 bg-[var(--surface)] hover:border-[var(--primary)]/40 hover:shadow-xl transition-all duration-300 outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <Card className="w-full h-full bg-transparent border-none p-0 rounded-none shadow-none">
                {story.thumbnail && (
                  <Image
                    src={story.thumbnail}
                    alt={story.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />

                {/* Small Overlay Glass Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="p-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full group-hover:scale-110 group-hover:bg-[var(--primary)] group-hover:text-black transition-all duration-300">
                    <Play size={16} className="fill-current ml-0.5" />
                  </div>
                </div>

                {/* Card Meta Content */}
                <CardFooter className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-transparent border-none flex flex-col items-start space-y-1 text-left">
                  <p className="text-[11px] font-bold text-[var(--primary)] font-hind">{story.farmerName} • {story.location}</p>
                  <h4 className="text-sm font-black text-white font-hind line-clamp-2 leading-tight">
                    {story.title}
                  </h4>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}