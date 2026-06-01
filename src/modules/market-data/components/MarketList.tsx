"use client";
import type { IMarketPrice } from "@/shared/types/market";
import { motion } from "framer-motion";

export default function MarketList({ items, selectedId, onSelect }: { items: IMarketPrice[]; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-3 h-full overflow-y-auto pr-2 custom-scrollbar">
      {items.map((fish) => (
        <motion.button
          key={fish._id}
          whileHover={{ scale: 0.98 }}
          onClick={() => onSelect(fish._id)}
          className={`w-full p-5 rounded-3xl border transition-all duration-300 text-left backdrop-blur-md ${
            selectedId === fish._id 
              ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20 border-transparent" 
              : "bg-[var(--surface)]/50 border-[var(--border)] hover:border-[var(--primary)]/50"
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="font-black text-lg">{fish.fishName}</span>
            <span className="font-black text-xl">৳{fish.currentPrice}</span>
          </div>
          <p className={`text-xs font-bold mt-1 ${selectedId === fish._id ? "text-white/70" : "opacity-40"}`}>{fish.location}</p>
        </motion.button>
      ))}
    </div>
  );
}