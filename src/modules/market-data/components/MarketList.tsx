"use client";

import type { IMarketPrice } from "@/shared/types/market";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

export default function MarketList({
  items,
  selectedId,
  onSelect,
}: {
  items: IMarketPrice[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="bg-[var(--surface)]/30 border border-[var(--border)]/60 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-[var(--border)]/60">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-50">
          তালিকা
        </p>
      </div>

      <ul className="max-h-[650px] overflow-y-auto">
        {items.map((fish) => {
          const isActive = fish._id === selectedId;
          const TrendIcon =
            fish.trend === "up" ? TrendingUp : fish.trend === "down" ? TrendingDown : Minus;

          const trendClass =
            fish.trend === "up"
              ? "text-red-400"
              : fish.trend === "down"
                ? "text-emerald-400"
                : "text-[var(--text)]/40";

          return (
            <li key={fish._id}>
              <button
                type="button"
                onClick={() => onSelect(fish._id)}
                className={[
                  "w-full text-left p-4 flex items-center justify-between gap-4 border-b border-[var(--border)]/40 transition-colors",
                  isActive ? "bg-[var(--surface)]" : "hover:bg-[var(--surface)]/60",
                ].join(" ")}
              >
                <div className="min-w-0">
                  <p className="font-black truncate">{fish.fishName}</p>
                  <p className="text-xs font-bold opacity-40 truncate">{fish.location}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-bold opacity-40">দর</p>
                    <p className="text-lg font-black">
                      <span className="text-xs text-[var(--primary)] font-black">৳</span>{" "}
                      {fish.currentPrice}
                    </p>
                  </div>
                  <span className={trendClass} aria-label="trend">
                    <TrendIcon size={18} />
                  </span>
                </div>
              </button>
            </li>
          );
        })}

        {items.length === 0 && (
          <li className="p-10 text-center">
            <p className="font-black opacity-40">কোনো ডাটা পাওয়া যায়নি</p>
          </li>
        )}
      </ul>
    </div>
  );
}

