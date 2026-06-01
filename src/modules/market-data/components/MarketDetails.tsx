"use client";
import type { IMarketPrice } from "@/shared/types/market";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

export default function MarketDetails({ fish }: { fish: IMarketPrice | null }) {
  if (!fish) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 shadow-sm">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-5xl font-black mb-2">{fish.fishName}</h2>
          <p className="font-bold opacity-50">{fish.location}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest font-black opacity-40">বর্তমান দর</p>
          <p className="text-5xl font-black text-[var(--primary)]">৳{fish.currentPrice}</p>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={fish.history}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4}/>
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip contentStyle={{ borderRadius: "16px", background: "#fff", border: "none" }} />
            <Area type="monotone" dataKey="price" stroke="var(--primary)" strokeWidth={4} fill="url(#colorPrice)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}