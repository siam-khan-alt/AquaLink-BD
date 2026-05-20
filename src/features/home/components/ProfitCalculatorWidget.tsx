"use client";

import { useState, useMemo } from "react";
import { TrendingUp, Scale, DollarSign, Calculator } from "lucide-react";

export default function ProfitCalculatorWidget() {
  const [pondSize, setPondSize] = useState<number>(1);
  const [fishCount, setFishCount] = useState<number>(1000);
  const [feedCostPerKg, setFeedCostPerKg] = useState<number>(80);
  const [expectedGrowth, setExpectedGrowth] = useState<number>(500);
  const [marketPricePerKg, setMarketPricePerKg] = useState<number>(350);

  const calculations = useMemo(() => {
    const totalFishWeight = (fishCount * expectedGrowth) / 1000;
    const totalRevenue = totalFishWeight * marketPricePerKg;
    const totalFeedNeeded = (fishCount * expectedGrowth * 2.5) / 1000;
    const totalFeedCost = totalFeedNeeded * feedCostPerKg;
    const otherCosts = pondSize * 5000;
    const totalCost = totalFeedCost + otherCosts;
    const netProfit = totalRevenue - totalCost;
    const roi = totalCost > 0 ? ((netProfit / totalCost) * 100) : 0;

    return {
      totalFishWeight,
      totalRevenue,
      totalFeedNeeded,
      totalFeedCost,
      otherCosts,
      totalCost,
      netProfit,
      roi,
    };
  }, [pondSize, fishCount, feedCostPerKg, expectedGrowth, marketPricePerKg]);

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[var(--primary)]/10 rounded-xl">
          <Calculator className="text-[var(--primary)]" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-[var(--text)]">লাভ ক্যালকুলেটর</h3>
          <p className="text-xs font-bold text-[var(--text)]/50">আপনার বিনিয়োগের হিসাব দেখুন</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-[var(--text)] mb-2">
            <Scale size={16} className="text-[var(--primary)]" />
            পুকুরের আকার (শতাংশ)
          </label>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            value={pondSize}
            onChange={(e) => setPondSize(Number(e.target.value))}
            className="w-full h-2 bg-[var(--background)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
          />
          <div className="text-right text-sm font-black text-[var(--primary)] mt-1">{pondSize} শতাংশ</div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-[var(--text)] mb-2">
            <Scale size={16} className="text-[var(--primary)]" />
            মাছের সংখ্যা
          </label>
          <input
            type="range"
            min="100"
            max="5000"
            step="100"
            value={fishCount}
            onChange={(e) => setFishCount(Number(e.target.value))}
            className="w-full h-2 bg-[var(--background)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
          />
          <div className="text-right text-sm font-black text-[var(--primary)] mt-1">{fishCount} টি</div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-[var(--text)] mb-2">
            <DollarSign size={16} className="text-[var(--primary)]" />
            খাবারের দাম (প্রতি কেজি)
          </label>
          <input
            type="range"
            min="50"
            max="150"
            step="5"
            value={feedCostPerKg}
            onChange={(e) => setFeedCostPerKg(Number(e.target.value))}
            className="w-full h-2 bg-[var(--background)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
          />
          <div className="text-right text-sm font-black text-[var(--primary)] mt-1">{feedCostPerKg} টাকা</div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-[var(--text)] mb-2">
            <TrendingUp size={16} className="text-[var(--primary)]" />
            প্রত্যাশিত ওজন (প্রতি মাছ গ্রাম)
          </label>
          <input
            type="range"
            min="200"
            max="1000"
            step="50"
            value={expectedGrowth}
            onChange={(e) => setExpectedGrowth(Number(e.target.value))}
            className="w-full h-2 bg-[var(--background)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
          />
          <div className="text-right text-sm font-black text-[var(--primary)] mt-1">{expectedGrowth} গ্রাম</div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-[var(--text)] mb-2">
            <DollarSign size={16} className="text-[var(--primary)]" />
            বাজার দাম (প্রতি কেজি)
          </label>
          <input
            type="range"
            min="200"
            max="600"
            step="10"
            value={marketPricePerKg}
            onChange={(e) => setMarketPricePerKg(Number(e.target.value))}
            className="w-full h-2 bg-[var(--background)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
          />
          <div className="text-right text-sm font-black text-[var(--primary)] mt-1">{marketPricePerKg} টাকা</div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-[var(--border)] space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-[var(--text)]/70">মোট আয়</span>
          <span className="text-lg font-black text-emerald-500">{calculations.totalRevenue.toLocaleString()} টাকা</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-[var(--text)]/70">মোট খরচ</span>
          <span className="text-lg font-black text-red-500">{calculations.totalCost.toLocaleString()} টাকা</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-[var(--border)]">
          <span className="text-sm font-bold text-[var(--text)]">নিট লাভ</span>
          <span className={`text-xl font-black ${calculations.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {calculations.netProfit.toLocaleString()} টাকা
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-[var(--text)]/70">ROI</span>
          <span className={`text-lg font-black ${calculations.roi >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {calculations.roi.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
