"use client";

import { useState, useMemo } from "react";
import { IMarketPrice } from "@/shared/types/market";
import { AnimatePresence } from "framer-motion";
import MarketList from "./MarketList";
import MarketDetails from "./MarketDetails";

interface MarketUIProps {
  initialData: IMarketPrice[];
}

export type SortOption = "latest" | "price-high" | "price-low" | "name";

export default function MarketUI({ initialData }: MarketUIProps) {
  const [selectedId, setSelectedId] = useState<string>(initialData[0]?._id || "");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  const filteredData = useMemo(() => {
    const result = [...initialData].filter((fish) =>
      fish.fishName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortBy) {
      case "price-high": result.sort((a, b) => b.currentPrice - a.currentPrice); break;
      case "price-low": result.sort((a, b) => a.currentPrice - b.currentPrice); break;
      case "name": result.sort((a, b) => a.fishName.localeCompare(b.fishName)); break;
      default: result.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    }
    return result;
  }, [initialData, searchQuery, sortBy]);

  const selectedFish = useMemo(() => 
    initialData.find((f) => f._id === selectedId), 
    [initialData, selectedId]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-10 items-start">
      {/* Left Side */}
      <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
        <MarketList 
          data={filteredData}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onSearch={setSearchQuery}
          onSort={setSortBy}
          currentSort={sortBy}
        />
      </div>

      {/* Right Side */}
      <div className="lg:col-span-7 lg:sticky lg:top-24 order-1 lg:order-2">
        <AnimatePresence mode="wait">
          {selectedFish ? (
            <MarketDetails key={selectedFish._id} fish={selectedFish} />
          ) : (
            <div className="h-[500px] flex items-center justify-center border-2 border-dashed border-[var(--border)] rounded-[2.5rem] opacity-20 font-bold">
              বিশ্লেষণ দেখতে মাছ নির্বাচন করুন
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}