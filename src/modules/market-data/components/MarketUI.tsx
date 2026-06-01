"use client";
import { useMemo, useState } from "react";
import type { IMarketPrice, FishCategory } from "@/shared/types/market";
import MarketList from "./MarketList";
import MarketDetails from "./MarketDetails";

export default function MarketUI({ initialData }: { initialData: IMarketPrice[] }) {
  const [selectedId, setSelectedId] = useState<string>(initialData[0]?._id ?? "");
  const selected = useMemo(() => initialData.find(f => f._id === selectedId) ?? initialData[0] ?? null, [initialData, selectedId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <section className="lg:col-span-4 h-[700px] overflow-hidden">
        <MarketList items={initialData} selectedId={selectedId} onSelect={setSelectedId} />
      </section>
      <section className="lg:col-span-8">
        <MarketDetails fish={selected} />
      </section>
    </div>
  );
}