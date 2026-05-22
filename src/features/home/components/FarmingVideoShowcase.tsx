"use client";

import React from "react";
import { Play, Clock, Eye } from "lucide-react";

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
        {mockVideos.map((video, index) => (
          <article
            key={video.id}
            className={`relative aspect-video rounded-2xl overflow-hidden group cursor-pointer ${
              index === 0 ? "md:col-span-2 lg:col-span-2" : ""
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg">
              <Clock size={12} className="text-white" />
              <span className="text-xs text-white font-hind font-black uppercase tracking-widest">{video.duration}</span>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                <Play size={24} className="text-[#020617] fill-current ml-1" />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
              <h3 className="text-base font-black text-white leading-tight line-clamp-2 font-hind">
                {video.title}
              </h3>
              
              <div className="flex items-center gap-2 text-white/70">
                <div className="flex items-center gap-1">
                  <Eye size={12} />
                  <span className="text-xs font-hind">{video.views}</span>
                </div>
              </div>
            </div>
          </article>
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
