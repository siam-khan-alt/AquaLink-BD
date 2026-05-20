"use client";

import { Play, BookOpen, TrendingUp, Award, Users } from "lucide-react";

interface Story {
  id: string;
  farmerName: string;
  location: string;
  title: string;
  description: string;
  category: "video" | "article";
  thumbnail: string;
  duration?: string;
  readTime?: string;
  achievement: string;
}

const STORIES: Story[] = [
  {
    id: "1",
    farmerName: "আব্দুল করিম",
    location: "যশোর",
    title: "রুই মাছ চাষে সাফল্যের গল্প",
    description: "৫ বিঘা পুকুরে আধুনিক পদ্ধতিতে রুই মাছ চাষ করে বছরে ১৫ লাখ টাকা লাভ করেছেন আব্দুল করিম।",
    category: "video",
    thumbnail: "/images/stories/story-1.jpg",
    duration: "৮:৩০",
    achievement: "১৫ লাখ টাকা লাভ",
  },
  {
    id: "2",
    farmerName: "রহিমা বেগম",
    location: "মুন্সিগঞ্জ",
    title: "গলদা চিংড়ি চাষে নারী উদ্যোক্তা",
    description: "রহিমা বেগম গলদা চিংড়ি চাষ করে এলাকার অন্যতম সফল নারী উদ্যোক্তা হিসেবে পরিচিতি পেয়েছেন।",
    category: "article",
    thumbnail: "/images/stories/story-2.jpg",
    readTime: "৫ মিনিট",
    achievement: "২০ লাখ টাকা বার্ষিক আয়",
  },
  {
    id: "3",
    farmerName: "মোহাম্মদ আলী",
    location: "কুমিল্লা",
    title: "পাঙাশ চাষে বিপ্লব",
    description: "আধুনিক প্রযুক্তি ব্যবহার করে পাঙাশ চাষে নতুন দিগন্ত সৃষ্টি করেছেন মোহাম্মদ আলী।",
    category: "video",
    thumbnail: "/images/stories/story-3.jpg",
    duration: "১২:৪৫",
    achievement: "২৫ লাখ টাকা লাভ",
  },
  {
    id: "4",
    farmerName: "ফাতেমা খাতুন",
    location: "পাবনা",
    title: "মিশ্র মাছ চাষের সাফল্য",
    description: "ফাতেমা খাতুন মিশ্র মাছ চাষ করে ঝুঁকি কমিয়ে লাভবান হচ্ছেন।",
    category: "article",
    thumbnail: "/images/stories/story-4.jpg",
    readTime: "৭ মিনিট",
    achievement: "১৮ লাখ টাকা আয়",
  },
  {
    id: "5",
    farmerName: "হাসান মাহমুদ",
    location: "বগুড়া",
    title: "কার্প মাছের উন্নত জাত",
    description: "উন্নত জাতের কার্প মাছ চাষ করে হাসান মাহমুদ এলাকায় আদর্শ হয়ে উঠেছেন।",
    category: "video",
    thumbnail: "/images/stories/story-5.jpg",
    duration: "১০:১৫",
    achievement: "২২ লাখ টাকা লাভ",
  },
  {
    id: "6",
    farmerName: "জাহানারা বেগম",
    location: "নওগাঁ",
    title: "তেলাপিয়া চাষে নারী নেতৃত্ব",
    description: "জাহানারা বেগম তেলাপিয়া চাষ করে নারীদের জন্য অনুপ্রেরণা হয়ে উঠেছেন।",
    category: "article",
    thumbnail: "/images/stories/story-6.jpg",
    readTime: "৬ মিনিট",
    achievement: "১২ লাখ টাকা আয়",
  },
];

export default function SuccessfulFarmerStories() {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-[var(--text)] tracking-tighter">
            সফল চাষিদের <span className="text-[var(--primary)]">গল্প</span>
          </h2>
          <p className="text-lg font-bold text-[var(--text)]/50 mt-2">
            আপনার অনুপ্রেরণা খুঁজুন
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[var(--primary)]">
          <Users size={20} />
          <span className="text-sm font-black uppercase tracking-widest">৫০০+ সফল চাষি</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STORIES.map((story) => (
          <article
            key={story.id}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[var(--primary)]/30 transition-all group"
          >
            <div className="relative h-48 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)] flex items-center justify-center">
              {story.category === "video" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                  <div className="p-4 bg-[var(--primary)] rounded-full group-hover:scale-110 transition-transform">
                    <Play size={24} className="text-[#020617]" fill="currentColor" />
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                  <div className="p-4 bg-[var(--primary)] rounded-full group-hover:scale-110 transition-transform">
                    <BookOpen size={24} className="text-[#020617]" />
                  </div>
                </div>
              )}
              <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-black text-white uppercase tracking-widest">
                {story.category === "video" ? story.duration : story.readTime}
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                    <Award size={16} className="text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[var(--text)]">{story.farmerName}</p>
                    <p className="text-xs font-bold text-[var(--text)]/50">{story.location}</p>
                  </div>
                </div>
                <h3 className="text-lg font-black text-[var(--text)] leading-tight group-hover:text-[var(--primary)] transition-colors">
                  {story.title}
                </h3>
                <p className="text-sm font-medium text-[var(--text)]/60 mt-2 line-clamp-2">
                  {story.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-500">
                  <TrendingUp size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">{story.achievement}</span>
                </div>
                <button className="px-4 py-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg text-xs font-black uppercase tracking-widest hover:bg-[var(--primary)] hover:text-[#020617] transition-all">
                  {story.category === "video" ? "দেখুন" : "পড়ুন"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
