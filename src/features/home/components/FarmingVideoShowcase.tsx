"use client";

import React from "react";
import { Play, Clock, Eye } from "lucide-react";
import Card from "@/components/ui/Card";

interface VideoItem {
  id: string;
  title: string;
  duration: string;
  views: string;
  thumbnail: string;
}

const mockVideos: VideoItem[] = [
  {
    id: "1",
    title: "আধুনিক পুকুর ব্যবস্থাপনা কৌশল",
    duration: "১২:৩০",
    views: "১.২ হাজার",
    thumbnail: "",
  },
  {
    id: "2",
    title: "মাছের রোগ নির্ণয় ও চিকিৎসা",
    duration: "১৫:৪৫",
    views: "৮৫০",
    thumbnail: "",
  },
  {
    id: "3",
    title: "পুকুরে চুন দেওয়ার সঠিক পদ্ধতি",
    duration: "৮:২০",
    views: "২.১ হাজার",
    thumbnail: "",
  },
  {
    id: "4",
    title: "মাছের খাবার নির্বাচন ও প্রয়োগ",
    duration: "১০:১৫",
    views: "১.৫ হাজার",
    thumbnail: "",
  },
];

export default function FarmingVideoShowcase() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[var(--text)] mb-2 font-hind">
          মাছ চাষের ভিডিও টিউটোরিয়াল
        </h2>
        <p className="text-sm text-[var(--text)]/60 font-hind">
          বিশেষজ্ঞদের থেকে মাছ চাষের আধুনিক কৌশল শিখুন
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockVideos.map((video) => (
          <Card
            key={video.id}
            className="bg-[var(--surface)] border border-[var(--border)] overflow-hidden hover:shadow-xl hover:border-[var(--primary)]/30 transition-all duration-300 cursor-pointer group"
          >
            <div className="relative aspect-video bg-[var(--background)] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/60 rounded-md">
                <Clock size={12} className="text-white" />
                <span className="text-xs text-white font-hind">{video.duration}</span>
              </div>
              <div className="relative z-10 p-4">
                <div className="w-12 h-12 bg-[var(--primary)]/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play size={20} className="text-white fill-white ml-1" />
                </div>
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-sm font-bold text-[var(--text)] line-clamp-2 mb-2 font-hind">
                {video.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-[var(--text)]/60 font-hind">
                <div className="flex items-center gap-1">
                  <Eye size={12} />
                  <span>{video.views}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button className="px-6 py-3 bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-xl hover:bg-[var(--border)] transition-colors font-hind text-sm font-semibold">
          আরও ভিডিও দেখুন
        </button>
      </div>
    </div>
  );
}
