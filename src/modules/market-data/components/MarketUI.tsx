"use client";

import { useMemo, useState } from "react";
import type { IMarketPrice, FishCategory } from "@/shared/types/market";
import { BarChart3, Filter, Search } from "lucide-react";
import MarketList from "./MarketList";
import MarketDetails from "./MarketDetails";

type HistoryRange = "week" | "month";

const CATEGORY_LABELS: Record<FishCategory | "all", string> = {
  all: "সব",
  carp: "কার্প",
  catfish: "ক্যাটফিশ",
  prawn: "চিংড়ি",
  others: "অন্যান্য",
};

export default function MarketUI({ initialData }: { initialData: IMarketPrice[] }) {
  const [category, setCategory] = useState<FishCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<HistoryRange>("week");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialData
      .filter((i) => (category === "all" ? true : i.category === category))
      .filter((i) => (q ? i.fishName.toLowerCase().includes(q) : true));
  }, [initialData, category, query]);

  const [selectedId, setSelectedId] = useState<string>(() => filtered[0]?._id ?? initialData[0]?._id ?? "");

  const selected = useMemo(
    () => filtered.find((f) => f._id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
      {/* Filters */}
      <section className="lg:col-span-12 flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex items-center gap-2 text-[var(--text)]/70">
          <BarChart3 size={18} className="text-[var(--primary)]" />
          <p className="text-xs font-black uppercase tracking-widest">Market Explorer</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-[280px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]">
              <Search size={18} />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="মাছের নাম লিখে খুঁজুন"
              className="w-full h-11 pl-10 pr-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 text-sm font-semibold"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[var(--text)]/50">
              <Filter size={18} />
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FishCategory | "all")}
              className="h-11 rounded-xl bg-[var(--surface)] border border-[var(--border)] px-3 text-sm font-bold outline-none focus:border-[var(--primary)]"
            >
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={range}
              onChange={(e) => setRange(e.target.value as HistoryRange)}
              className="h-11 rounded-xl bg-[var(--surface)] border border-[var(--border)] px-3 text-sm font-bold outline-none focus:border-[var(--primary)]"
            >
              <option value="week">৭ দিন</option>
              <option value="month">৩০ দিন</option>
            </select>
          </div>
        </div>
      </section>

      {/* List */}
      <section className="lg:col-span-5">
        <MarketList
          items={filtered}
          selectedId={selected?._id ?? ""}
          onSelect={setSelectedId}
        />
      </section>

      {/* Details */}
      <section className="lg:col-span-7">
        <MarketDetails fish={selected} range={range} />
      </section>
    </div>
  );
}

