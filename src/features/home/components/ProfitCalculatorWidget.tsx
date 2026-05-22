"use client";

import { useState, useMemo } from "react";
import { TrendingUp, Scale, DollarSign, Calculator } from "lucide-react";
import { Card, Slider } from "@heroui/react";

function handleSliderValueChange(
  value: number | number[],
  setter: (value: number) => void
): void {
  if (typeof value === 'number') {
    setter(value);
  } else if (Array.isArray(value) && value.length > 0) {
    setter(value[0]);
  }
}

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
    <Card className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.08] shadow-2xl rounded-2xl p-6">
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
          <Slider
            size="lg"
            step={0.5}
            minValue={0.5}
            maxValue={10}
            value={pondSize}
            onChange={(value) => handleSliderValueChange(value, setPondSize)}
            color="primary"
            className="w-full"
            classNames={{
              track: "bg-[var(--background)]/40",
              filler: "bg-[var(--primary)]",
              thumb: "bg-[var(--primary)] border-2 border-white/20",
            }}
          />
          <div className="text-right text-sm font-black text-[var(--primary)] mt-1">{pondSize} শতাংশ</div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-[var(--text)] mb-2">
            <Scale size={16} className="text-[var(--primary)]" />
            মাছের সংখ্যা
          </label>
          <Slider
            size="lg"
            step={100}
            minValue={100}
            maxValue={5000}
            value={fishCount}
            onChange={(value) => handleSliderValueChange(value, setFishCount)}
            color="primary"
            className="w-full"
            classNames={{
              track: "bg-[var(--background)]/40",
              filler: "bg-[var(--primary)]",
              thumb: "bg-[var(--primary)] border-2 border-white/20",
            }}
          />
          <div className="text-right text-sm font-black text-[var(--primary)] mt-1">{fishCount} টি</div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-[var(--text)] mb-2">
            <DollarSign size={16} className="text-[var(--primary)]" />
            খাবারের দাম (প্রতি কেজি)
          </label>
          <Slider
            size="lg"
            step={5}
            minValue={50}
            maxValue={150}
            value={feedCostPerKg}
            onChange={(value) => handleSliderValueChange(value, setFeedCostPerKg)}
            color="primary"
            className="w-full"
            classNames={{
              track: "bg-[var(--background)]/40",
              filler: "bg-[var(--primary)]",
              thumb: "bg-[var(--primary)] border-2 border-white/20",
            }}
          />
          <div className="text-right text-sm font-black text-[var(--primary)] mt-1">{feedCostPerKg} টাকা</div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-[var(--text)] mb-2">
            <TrendingUp size={16} className="text-[var(--primary)]" />
            প্রত্যাশিত ওজন (প্রতি মাছ গ্রাম)
          </label>
          <Slider
            size="lg"
            step={50}
            minValue={200}
            maxValue={1000}
            value={expectedGrowth}
            onChange={(value) => handleSliderValueChange(value, setExpectedGrowth)}
            color="primary"
            className="w-full"
            classNames={{
              track: "bg-[var(--background)]/40",
              filler: "bg-[var(--primary)]",
              thumb: "bg-[var(--primary)] border-2 border-white/20",
            }}
          />
          <div className="text-right text-sm font-black text-[var(--primary)] mt-1">{expectedGrowth} গ্রাম</div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-[var(--text)] mb-2">
            <DollarSign size={16} className="text-[var(--primary)]" />
            বাজার দাম (প্রতি কেজি)
          </label>
          <Slider
            size="lg"
            step={10}
            minValue={200}
            maxValue={600}
            value={marketPricePerKg}
            onChange={(value) => handleSliderValueChange(value, setMarketPricePerKg)}
            color="primary"
            className="w-full"
            classNames={{
              track: "bg-[var(--background)]/40",
              filler: "bg-[var(--primary)]",
              thumb: "bg-[var(--primary)] border-2 border-white/20",
            }}
          />
          <div className="text-right text-sm font-black text-[var(--primary)] mt-1">{marketPricePerKg} টাকা</div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-[var(--border)]/60 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-[var(--text)]/70">মোট আয়</span>
          <span className="text-lg font-black text-emerald-500">{calculations.totalRevenue.toLocaleString()} টাকা</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-[var(--text)]/70">মোট খরচ</span>
          <span className="text-lg font-black text-red-500">{calculations.totalCost.toLocaleString()} টাকা</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-[var(--border)]/60">
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
    </Card>
  );
}
