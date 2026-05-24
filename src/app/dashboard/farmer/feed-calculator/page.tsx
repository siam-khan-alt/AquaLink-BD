"use client";

import React, {  useState } from "react";
import { Calculator, TrendingUp, DollarSign, Fish, Droplets, ChevronDown } from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface FeedCalculationResult {
  biomass: number;
  dailyFeedKg: number;
  dailyFeedCost: number;
  monthlyFeedCost: number;
  feedRate: number;
}

interface FishTypeConfig {
  name: string;
  feedRate: number;
  feedPricePerKg: number;
  icon: React.ReactNode;
}

const fishTypes: FishTypeConfig[] = [
  { name: "রুই", feedRate: 3.0, feedPricePerKg: 45, icon: <Fish size={20} /> },
  { name: "কাতল", feedRate: 2.8, feedPricePerKg: 48, icon: <Fish size={20} /> },
  { name: "মৃগেল", feedRate: 2.5, feedPricePerKg: 50, icon: <Fish size={20} /> },
  { name: "তেলাপিয়া", feedRate: 4.0, feedPricePerKg: 35, icon: <Fish size={20} /> },
  { name: "পাঙ্গাস", feedRate: 3.5, feedPricePerKg: 40, icon: <Fish size={20} /> },
  { name: "সর্পুতি", feedRate: 3.2, feedPricePerKg: 42, icon: <Fish size={20} /> },
];

const formatBDT = (val: number): string => {
  return "৳ " + new Intl.NumberFormat("bn-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};

const formatNumber = (val: number): string => {
  return new Intl.NumberFormat("bn-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

export default function FeedCalculatorPage() {
  const [fishType, setFishType] = useState<string>("রুই");
  const [fishCount, setFishCount] = useState<string>("");
  const [avgWeight, setAvgWeight] = useState<string>("");
  const [waterTemp, setWaterTemp] = useState<string>("");
  const [result, setResult] = useState<FeedCalculationResult | null>(null);


  const selectedFish = fishTypes.find((f) => f.name === fishType) || fishTypes[0];

  const calculateFeed = () => {
    const count = parseFloat(fishCount);
    const weight = parseFloat(avgWeight);
    const temp = waterTemp ? parseFloat(waterTemp) : 28;

    if (isNaN(count) || isNaN(weight) || count <= 0 || weight <= 0) {
      return;
    }

    // Calculate biomass in kg
    const biomass = (count * weight) / 1000;

    // Adjust feed rate based on water temperature
    let adjustedFeedRate = selectedFish.feedRate;
    if (temp < 20) {
      adjustedFeedRate *= 0.7; // Reduce feed in cold water
    } else if (temp > 32) {
      adjustedFeedRate *= 0.8; // Reduce feed in hot water
    }

    // Calculate daily feed required in kg
    const dailyFeedKg = (biomass * adjustedFeedRate) / 100;

    // Calculate costs
    const dailyFeedCost = dailyFeedKg * selectedFish.feedPricePerKg;
    const monthlyFeedCost = dailyFeedCost * 30;

    setResult({
      biomass,
      dailyFeedKg,
      dailyFeedCost,
      monthlyFeedCost,
      feedRate: adjustedFeedRate,
    });
  };

  const resetCalculator = () => {
    setFishCount("");
    setAvgWeight("");
    setWaterTemp("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
            <Calculator size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text)] font-hind">
              স্মার্ট ফিড ক্যালকুলেটর
            </h1>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              আপনার মাছের খাদ্য খরচ এবং ROI অপ্টিমাইজ করুন
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Input Card */}
          <Card className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-[var(--text)] font-hind flex items-center gap-2">
              <Fish size={20} className="text-[var(--primary)]" />
              ইনপুট তথ্য
            </h2>

            <div className="space-y-4">
              {/* Fish Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--text)] font-hind">
                  মাছের ধরন
                </label>
                <div className="relative">
                  <select
                    value={fishType}
                    onChange={(e) => setFishType(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--text)] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 font-hind"
                  >
                    {fishTypes.map((fish) => (
                      <option key={fish.name} value={fish.name}>
                        {fish.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text)]/60 pointer-events-none" size={20} />
                </div>
              </div>

              {/* Fish Count */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--text)] font-hind">
                  পুকুরে মাছের সংখ্যা
                </label>
                <Input
                  type="number"
                  placeholder="মোট মাছের সংখ্যা লিখুন"
                  value={fishCount}
                  onChange={(e) => setFishCount(e.target.value)}
                  className="bg-[var(--background)] border-[var(--border)] text-[var(--text)]"
                />
              </div>

              {/* Average Weight */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--text)] font-hind">
                  মাছের গড় ওজন (গ্রাম)
                </label>
                <Input
                  type="number"
                  placeholder="গড় ওজন গ্রামে লিখুন"
                  value={avgWeight}
                  onChange={(e) => setAvgWeight(e.target.value)}
                  className="bg-[var(--background)] border-[var(--border)] text-[var(--text)]"
                />
              </div>

              {/* Water Temperature (Optional) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--text)] font-hind flex items-center gap-2">
                  <Droplets size={16} className="text-[var(--primary)]" />
                  পানির তাপমাত্রা (ঐচ্ছিক)
                </label>
                <Input
                  type="number"
                  placeholder="তাপমাত্রা সেলসিয়াসে লিখুন"
                  value={waterTemp}
                  onChange={(e) => setWaterTemp(e.target.value)}
                  className="bg-[var(--background)] border-[var(--border)] text-[var(--text)]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={calculateFeed}
                  className="flex-1 font-hind text-sm h-11 flex items-center justify-center gap-2"
                >
                  <Calculator size={16} />
                  হিসাব করুন
                </Button>
                <Button
                  variant="outline"
                  onClick={resetCalculator}
                  className="flex-1 font-hind text-sm h-11"
                >
                  রিসেট
                </Button>
              </div>
            </div>
          </Card>

          {/* Results Card */}
          <Card className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-[var(--text)] font-hind flex items-center gap-2">
              <TrendingUp size={20} className="text-[var(--primary)]" />
              ফলাফল ও খরচ বিশ্লেষণ
            </h2>

            {result ? (
              <div className="space-y-4">
                {/* Biomass Card */}
                <div className="p-4 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-[var(--primary)]">
                    <Fish size={18} />
                    <span className="text-sm font-semibold font-hind">মোট বায়োমাস</span>
                  </div>
                  <p className="text-2xl font-bold text-[var(--text)] font-hind">
                    {formatNumber(result.biomass)} কেজি
                  </p>
                </div>

                {/* Daily Feed Required */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Droplets size={18} />
                    <span className="text-sm font-semibold font-hind">দৈনিক ফিড প্রয়োজন</span>
                  </div>
                  <p className="text-2xl font-bold text-[var(--text)] font-hind">
                    {formatNumber(result.dailyFeedKg)} কেজি
                  </p>
                  <p className="text-xs text-[var(--text)]/60 font-hind">
                    ফিড রেট: {result.feedRate.toFixed(1)}%
                  </p>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-green-600">
                      <DollarSign size={18} />
                      <span className="text-sm font-semibold font-hind">দৈনিক খরচ</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--text)] font-hind">
                      {formatBDT(result.dailyFeedCost)}
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-amber-600">
                      <DollarSign size={18} />
                      <span className="text-sm font-semibold font-hind">মাসিক খরচ (আনুমানিক)</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--text)] font-hind">
                      {formatBDT(result.monthlyFeedCost)}
                    </p>
                  </div>
                </div>

                {/* Feed Price Info */}
                <div className="p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg">
                  <p className="text-xs text-[var(--text)]/60 font-hind">
                    ফিড দাম: {formatBDT(selectedFish.feedPricePerKg)} / কেজি
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-center">
                <div className="space-y-3">
                  <Calculator size={48} className="text-[var(--primary)]/30 mx-auto" />
                  <p className="text-sm text-[var(--text)]/60 font-hind">
                    ইনপুট তথ্য দিয়ে হিসাব করুন
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}
