"use client";

import type { IMarketPrice } from "@/shared/types/market";
import { getFilteredHistory } from "../utils";
import { CalendarClock, MapPin } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type HistoryRange = "week" | "month";

function formatBnDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleString("bn-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MarketDetails({
  fish,
  range,
}: {
  fish: IMarketPrice | null;
  range: HistoryRange;
}) {
  if (!fish) {
    return (
      <div className="h-full bg-[var(--surface)]/30 border border-[var(--border)]/60 rounded-2xl p-10 flex items-center justify-center">
        <p className="font-black opacity-40">ডিটেইলস দেখতে একটি মাছ নির্বাচন করুন</p>
      </div>
    );
  }

  const chartData = getFilteredHistory(fish.history ?? [], range);

  return (
    <div className="bg-[var(--surface)]/30 border border-[var(--border)]/60 rounded-2xl overflow-hidden">
      <header className="p-5 border-b border-[var(--border)]/60">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">{fish.fishName}</h3>
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold opacity-60">
              <span className="inline-flex items-center gap-2">
                <MapPin size={14} className="text-[var(--primary)]" />
                {fish.location}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarClock size={14} className="text-[var(--primary)]" />
                সর্বশেষ: {formatBnDate(fish.lastUpdated)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">বর্তমান দর</p>
            <p className="text-4xl font-black tracking-tighter">
              <span className="text-sm text-[var(--primary)] font-black">৳</span> {fish.currentPrice}
              <span className="text-sm font-black opacity-40">/{fish.unit}</span>
            </p>
          </div>
        </div>
      </header>

      <section className="p-5">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(148,163,184,0.15)" strokeDasharray="4 6" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fontWeight: 700, fill: "rgba(148,163,184,0.9)" }} />
              <YAxis tick={{ fontSize: 12, fontWeight: 700, fill: "rgba(148,163,184,0.9)" }} />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontWeight: 800,
                }}
                labelStyle={{ fontWeight: 900 }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="var(--primary)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, stroke: "var(--primary)", strokeWidth: 2, fill: "var(--background)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

