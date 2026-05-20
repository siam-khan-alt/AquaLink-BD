"use client";

import type { IMarketPrice } from "@/shared/types/market";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

function TrendIcon({ trend }: { trend: IMarketPrice["trend"] }) {
  if (trend === "up") return <TrendingUp size={14} />;
  if (trend === "down") return <TrendingDown size={14} />;
  return <Minus size={14} />;
}

export default function MarketTickerStream({ items }: { items: IMarketPrice[] }) {
  const safeItems = items.slice(0, 12);
  const loop = [...safeItems, ...safeItems];

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5">
      <div className="ticker-mask">
        <div className="flex gap-3 w-max animate-marquee py-3 pl-3 pr-10">
          {loop.map((i, idx) => (
            <div
              key={`${i._id}-${idx}`}
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-black/30 border border-white/10 text-white"
            >
              <span className="text-xs font-black whitespace-nowrap max-w-[180px] truncate">
                {i.fishName}
              </span>
              <span className="text-xs font-black text-[var(--primary)] whitespace-nowrap">
                ৳ {i.currentPrice}
              </span>
              <span className="opacity-70">
                <TrendIcon trend={i.trend} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

