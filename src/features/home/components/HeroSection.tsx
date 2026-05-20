"use client";

import Image from "next/image";
import { useMemo } from "react";
import { MessageSquareText, MoveRight, Sparkles } from "lucide-react";
import MarketTickerStream from "./MarketTickerStream";
import type { IMarketPrice } from "@/shared/types/market";
import { Button } from "@/components/ui/Button";
import { useAIStore } from "@/shared/store/useUIStore";

export default function HeroSection({
  tickerData,
}: {
  tickerData: IMarketPrice[];
}) {
  const { toggleChat } = useAIStore();

  const heroStyles = useMemo(
    () => ({
      background: `linear-gradient(to bottom right, var(--hero-bg-start), var(--hero-bg-mid), var(--hero-bg-end))`,
    }),
    []
  );

  return (
    <section
      style={heroStyles}
      className="relative overflow-hidden pt-20 pb-12"
    >
      <div className="container mx-auto px-6 grid lg:grid-cols-12 gap-10 items-center">
        <header className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 border border-white/15 text-white/90 text-sm font-semibold backdrop-blur-md">
            <Sparkles size={18} className="text-[var(--primary)]" />
            <span>বাংলাদেশের চাষির গর্ব — মৎস্য বন্ধু</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tighter">
            মাছ চাষে আনুন{" "}
            <span className="text-[var(--primary)]">ডিজিটাল ধারাবাহিকতা</span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl font-medium leading-relaxed">
            বাজার দর, রোগ গাইড, এবং স্মার্ট পরামর্শ — সবকিছু এক প্ল্যাটফর্মে।
            দ্রুত সিদ্ধান্ত নিন, অপচয় কমান, উৎপাদন বাড়ান।
          </p>

          <nav className="flex flex-wrap gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => toggleChat()}
              className="bg-[var(--primary)] text-[#020617] hover:opacity-90"
            >
              <MessageSquareText size={22} />
              AI সহকারী
              <MoveRight size={18} />
            </Button>
            <a
              href="/market-prices"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black text-white/90 border border-white/15 hover:bg-white/10 transition-colors"
            >
              বাজার দর দেখুন
              <MoveRight size={18} className="text-[var(--primary)]" />
            </a>
          </nav>
        </header>

        <aside className="lg:col-span-5 relative hidden lg:block min-h-[380px]">
          <div className="absolute inset-0 rounded-3xl border border-white/10 bg-black/20 backdrop-blur-sm shadow-2xl overflow-hidden">
            <div className="absolute inset-0 opacity-30">
              <Image
                src="/logo.png"
                alt="MatshoBondhu"
                fill
                className="object-contain p-12"
                priority
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">
                  লাইভ বাজার টিকার
                </p>
                <MarketTickerStream items={tickerData} />
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="container mx-auto px-6 mt-10 lg:hidden">
        <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">
            লাইভ বাজার টিকার
          </p>
          <MarketTickerStream items={tickerData} />
        </div>
      </div>
    </section>
  );
}
