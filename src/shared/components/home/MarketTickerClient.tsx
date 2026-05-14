"use client";
import { motion } from "framer-motion";
import { IMarketPrice } from "@/shared/types/market";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  fish: IMarketPrice;
  index: number;
}

export default function MarketTickerClient({ fish, index }: Props) {
  const prevPrice = fish.history?.[fish.history.length - 2]?.price || fish.currentPrice;
  const diff = fish.currentPrice - prevPrice;
  const isUp = diff > 0;
  const isDown = diff < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group flex flex-1 items-center justify-between p-6 bg-[var(--surface)]/40 backdrop-blur-xl border border-[var(--border)] rounded-2xl hover:border-[var(--primary)]/40 hover:bg-[var(--surface)] transition-all duration-300 h-full"
    >
      <div className="flex items-center gap-5 flex-1 min-w-0">
        <div className="h-12 w-12 flex-shrink-0 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-black text-sm border border-[var(--primary)]/20 group-hover:bg-[var(--primary)] group-hover:text-black transition-colors">
          {index + 1}
        </div>
        <div className="min-w-0">
          <h3 className="text-xl font-black tracking-tight truncate group-hover:text-[var(--primary)] transition-colors">
            {fish.fishName}
          </h3>
          <p className="text-[11px] font-bold opacity-40 mt-1">
             ঢাকার পাইকারি বাজারে
          </p>
        </div>
      </div>

      <div className="flex items-center gap-8 md:gap-16 text-right">
        <div>
          <span className="text-[10px] font-bold opacity-30 block mb-1">বর্তমান দর</span>
          <div className="flex items-baseline gap-1 justify-end">
            <span className="text-xs font-bold text-[var(--primary)]">৳</span>
            <span className="text-4xl font-black tracking-tighter leading-none">{fish.currentPrice}</span>
          </div>
        </div>

        <div className={`flex flex-col items-end min-w-[70px] ${isUp ? 'text-red-400' : isDown ? 'text-emerald-400' : 'text-gray-500'}`}>
          <span className="text-[10px] font-bold opacity-60 mb-1">পরিবর্তন</span>
          <div className="flex items-center gap-1 font-black text-sm">
            {isUp ? <TrendingUp size={14} /> : isDown ? <TrendingDown size={14} /> : <Minus size={14} />}
            {diff === 0 ? "স্থির" : `${Math.abs(diff)}৳`}
          </div>
        </div>
      </div>
    </motion.div>
  );
}