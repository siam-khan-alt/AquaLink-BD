"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquareText, MoveRight, Sparkles, TrendingUp } from "lucide-react";
import MarketTickerStream from "./MarketTickerStream";
import type { IMarketPrice } from "@/shared/types/market";
import { Button } from "@/components/ui/Button";
import { useAIStore } from "@/shared/store/useUIStore";

const heroStyles = {
  background: `linear-gradient(135deg, var(--hero-bg-start) 20%, var(--hero-bg-mid) 60%, var(--hero-bg-end) 100%)`,
};

const LiveMarketPanel = memo(({ tickerData, isMobile = false }: { tickerData: IMarketPrice[]; isMobile?: boolean }) => {
  if (isMobile) {
    return (
      <div className="container mx-auto px-6 mt-12 lg:hidden relative z-10">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-4 flex flex-col gap-4">
          <div className="relative h-32 w-full rounded-xl overflow-hidden">
            <Image
              src="/images/live-market.png"
              alt="Live Fish Market"
              fill
              sizes="(max-width: 768px) 100vw, 30vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-2 left-3 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">লাইভ বাজার টিকার</span>
            </div>
          </div>
          <div className="rounded-xl bg-black/20 p-3">
            <MarketTickerStream items={tickerData} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside className="lg:col-span-5 relative hidden lg:block">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl overflow-hidden p-4 flex flex-col gap-4">
        <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-white/5 shadow-inner group">
          <Image
            src="/images/live-market.png"
            alt="Live Fish Market"
            fill
            sizes="(min-width: 1024px) 40vw, 10vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1">
              <TrendingUp size={14} className="text-[var(--primary)]" /> লাইভ বাজার প্যানেল
            </span>
          </div>
        </div>
        <div className="rounded-2xl bg-black/30 border border-white/5 p-4 flex-1">
          <MarketTickerStream items={tickerData} />
        </div>
      </div>
    </aside>
  );
});

LiveMarketPanel.displayName = "LiveMarketPanel";

export default function HeroSection({ tickerData }: { tickerData: IMarketPrice[] }) {
  const { toggleChat } = useAIStore();

  return (
    <section style={heroStyles} className="relative overflow-hidden pt-18 pb-10 min-h-[70vh] flex items-center">
      <div className="absolute inset-0 z-0 h-full w-full pointer-events-none opacity-30 dark:opacity-20 mix-blend-screen dark:mix-blend-lightning">
        <Image
          src="/images/dashboard-analytics.png"
          alt="MatshoBondhu Data Analytics Dashboard"
          fill
          sizes="100vw"
          className="object-cover object-center"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[var(--hero-bg-start)]/40 to-[var(--hero-bg-start)]" />

      <div className="container mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center relative z-10">
        <header className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/90 text-sm font-semibold backdrop-blur-md shadow-lg">
            <Sparkles size={18} className="text-[var(--primary)] animate-pulse" />
            <span>বাংলাদেশের চাষির গর্ব — মৎস্য বন্ধু</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tighter drop-shadow-sm">
            মাছ চাষে আনুন{" "}
            <span className="text-[var(--primary)] bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[#a7f3d0]">
              ডিজিটাল ধারাবাহিকতা
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-2xl font-medium leading-relaxed">
            বাজার দর, রোগ গাইড, and SMART পরামর্শ — সবকিছু এক প্ল্যাটফর্মে। দ্রুত সিদ্ধান্ত নিন, অপচয় কমান, উৎপাদন বাড়ান।
          </p>

          <nav className="flex flex-wrap gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={toggleChat}
              className="bg-[var(--primary)] text-[#042421] font-bold hover:opacity-95 shadow-lg shadow-[var(--primary)]/20 active:scale-98 transition-transform"
            >
              <MessageSquareText size={22} />
              AI সহকারী
              <MoveRight size={18} />
            </Button>
            <Link
              href="/market-prices"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black text-white border border-white/10 bg-white/5 hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              বাজার দর দেখুন
              <MoveRight size={18} className="text-[var(--primary)]" />
            </Link>
          </nav>
        </header>

        <LiveMarketPanel tickerData={tickerData} />
      </div>

      <LiveMarketPanel tickerData={tickerData} isMobile />
    </section>
  );
}