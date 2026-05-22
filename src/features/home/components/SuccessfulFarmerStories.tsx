import { Play, BookOpen, TrendingUp, Award, Users } from "lucide-react";
import Image from "next/image";
import { Card, CardFooter, Button, Chip } from "@heroui/react";

interface Story {
  _id?: string;
  farmerName: string;
  location: string;
  title: string;
  description: string;
  thumbnail: string;
  achievement: string;
  createdAt: string;
}

async function getStories(): Promise<Story[]> {
  try {
    const res = await fetch("/api/home/stories", {
      next: { revalidate: 600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.stories || [];
  } catch {
    return [];
  }
}

function getStoryCategory(index: number): "video" | "article" {
  return index % 2 === 0 ? "video" : "article";
}

function getStoryDuration(index: number): string {
  const durations = ["৮:৩০", "৫ মিনিট", "১২:৪৫", "৭ মিনিট", "১০:১৫", "৬ মিনিট"];
  return durations[index % durations.length];
}

export default async function SuccessfulFarmerStories() {
  const stories = await getStories();

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
        {stories.map((story, index) => {
          const category = getStoryCategory(index);
          const duration = getStoryDuration(index);
          
          return (
            <Card
              key={story._id || story.title}
              className={`relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer hover:shadow-2xl transition-shadow ${
                index === 0 ? "md:col-span-2 lg:col-span-2" : ""
              }`}
            >
              <Image
                src={story.thumbnail}
                alt={story.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {category === "video" ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-4 bg-[var(--primary)] rounded-full group-hover:scale-110 transition-transform">
                    <Play size={24} className="text-[#020617]" fill="currentColor" />
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-4 bg-[var(--primary)] rounded-full group-hover:scale-110 transition-transform">
                    <BookOpen size={24} className="text-[#020617]" />
                  </div>
                </div>
              )}
              
              <div className="absolute top-3 right-3">
                <Chip
                  size="sm"
                  variant="soft"
                  className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest"
                >
                  {duration}
                </Chip>
              </div>

              <CardFooter className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/30 to-transparent border-none">
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 backdrop-blur-md flex items-center justify-center">
                      <Award size={16} className="text-[var(--primary)]" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{story.farmerName}</p>
                      <p className="text-xs font-bold text-white/70">{story.location}</p>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-black text-white leading-tight">
                    {story.title}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <TrendingUp size={16} />
                      <span className="text-xs font-black uppercase tracking-widest">{story.achievement}</span>
                    </div>
                    <Button
                      size="sm"
                      className="px-4 py-2 bg-[var(--primary)] text-[#020617] rounded-lg text-xs font-black uppercase tracking-widest hover:bg-[var(--primary)]/90 transition-all"
                    >
                      {category === "video" ? "দেখুন" : "পড়ুন"}
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
