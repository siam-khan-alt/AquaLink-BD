"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Play, X } from "lucide-react";
import Image from "next/image";
import { Card, Button, ScrollShadow } from "@heroui/react";

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

async function getStories(): Promise<Story[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/home/stories`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = (await res.json()) as IStoriesResponse;
    return data.stories || [];
  } catch (error) {
    return [];
  }
}

export default function SuccessfulFarmerStories() {
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [activeBigVideo, setActiveBigVideo] = useState<Story | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  useEffect(() => {
    let isMounted = true;
    getStories().then((data) => {
      if (isMounted) {
        setAllStories(data);
        const firstVideo = data.find((story) => story.contentType === "video");
        if (firstVideo) setActiveBigVideo(firstVideo);
        setIsLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const videoStories = useMemo(() => allStories.filter((s) => s.contentType === "video").slice(0, 4), [allStories]);
  const textStories = useMemo(() => allStories.filter((s) => s.contentType === "text").slice(0, 2), [allStories]);
  const bottomVideos = useMemo(() => {
    if (!activeBigVideo) return videoStories.slice(0, 3);
    return videoStories.filter((v) => v._id !== activeBigVideo._id).slice(0, 3);
  }, [videoStories, activeBigVideo]);

  if (isLoading) return null;

  return (
    <section className="space-y-8 container mx-auto py-8">
      <div className="flex items-end justify-between border-b border-[var(--border)]/40 pb-4">
        <h2 className="text-3xl md:text-4xl font-black text-[var(--text)] tracking-tighter font-hind">
          সফল চাষিদের <span className="text-[var(--primary)]">অনুপ্রেরণামূলক গল্প</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 flex-col-reverse lg:flex-row lg:grid-cols-3 gap-6">
        {activeBigVideo && (
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Card className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black">
              {isPlaying ? (
                <iframe src={`https://www.youtube.com/embed/${activeBigVideo.videoUrl}?autoplay=1`} className="w-full h-full" allowFullScreen />
              ) : (
                <>
                  <Image src={activeBigVideo.thumbnail} alt={activeBigVideo.title} fill className="object-cover brightness-75" unoptimized />
                  <button onClick={() => setIsPlaying(true)} className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center shadow-lg">
                      <Play size={26} className="text-black fill-current ml-1" />
                    </div>
                  </button>
                </>
              )}
            </Card>
          </div>
        )}

        <div className="flex lg:flex-col gap-4 w-full order-1 lg:order-2">
          <ScrollShadow orientation="horizontal" className="flex lg:flex-col gap-4 w-full pb-2">
            {textStories.map((story) => (
              <Card key={story._id} className="flex-shrink-0 w-[280px] lg:w-full flex flex-col rounded-2xl bg-[var(--surface)] border overflow-hidden h-64">
                <div className="relative h-28 w-full">
                  <Image src={story.thumbnail} alt={story.title} fill className="object-cover rounded-lg" style={{ objectPosition: "center 20%" }} unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)]/90 to-transparent" />
                </div>
                <div className="flex flex-col flex-grow justify-between p-4 -mt-10 relative z-10">
                  <div>
                    <span className="text-[10px] bg-[var(--primary)] text-white px-2 py-0.5 rounded font-bold uppercase shadow-sm">নিবন্ধ</span>
                    <h4 className="text-sm font-black mt-2 leading-tight text-[var(--text)] line-clamp-2">{story.title}</h4>
                  </div>
                  <Button size="sm" onClick={() => setSelectedStory(story)} className="mt-2 bg-[var(--primary)] text-white font-bold w-full rounded-xl">গল্পটি পড়ুন</Button>
                </div>
              </Card>
            ))}
          </ScrollShadow>
        </div>
      </div>

      <ScrollShadow orientation="horizontal" className="flex gap-6 pb-4">
        {bottomVideos.map((story) => (
          <div key={story._id} onClick={() => { setActiveBigVideo(story); setIsPlaying(false); }} className="flex-shrink-0 w-[280px] md:w-[320px] lg:w-auto lg:flex-1 relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group">
            <Image src={story.thumbnail} alt={story.title} fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
              <p className="text-[10px] text-[var(--primary)] font-bold">{story.farmerName}</p>
              <h4 className="text-sm font-bold text-white line-clamp-1">{story.title}</h4>
            </div>
          </div>
        ))}
      </ScrollShadow>

      {selectedStory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedStory(null)}>
          <div className="bg-[var(--surface)] p-6 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 p-2 bg-[var(--primary)]/50 rounded-full" onClick={() => setSelectedStory(null)}><X size={18} /></button>
            <h3 className="text-2xl font-black mb-2">{selectedStory.title}</h3>
            <p className="text-sm font-bold text-[var(--primary)] mb-4">{selectedStory.farmerName} | {selectedStory.location}</p>
            <Image src={selectedStory.thumbnail} alt={selectedStory.title} width={600} height={300} className="rounded-xl w-full" unoptimized />
            <p className="mt-4 text-[var(--text)] leading-relaxed">{selectedStory.description}</p>
            <div className="mt-6 p-4 bg-[var(--primary)]/10 rounded-xl border-l-4 border-[var(--primary)]">
              <p className="font-bold text-[var(--primary)] text-sm">অর্জন:</p>
              <p className="text-sm">{selectedStory.achievement}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}