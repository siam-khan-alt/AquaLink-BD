"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Fish, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";

interface PriceData {
  day: string;
  price: number;
}

interface TrendData {
  date: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  count: number;
}

interface TrendsResponse {
  success: boolean;
  fishName: string;
  days: number;
  trends: TrendData[];
}

const dayNames = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];

const formatBDT = (val: number): string => {
  return "৳ " + new Intl.NumberFormat("bn-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};

const calculateTrend = (data: PriceData[]): { percentage: number; isUp: boolean } => {
  if (data.length < 2) {
    return { percentage: 0, isUp: true };
  }
  const first = data[0].price;
  const last = data[data.length - 1].price;
  const percentage = ((last - first) / first) * 100;
  return {
    percentage: Math.abs(percentage),
    isUp: last > first,
  };
};

const getDayName = (dateStr: string): string => {
  const date = new Date(dateStr);
  const dayIndex = date.getDay();
  return dayNames[dayIndex];
};

export default function MarketTrendsInsight() {
  const { data: trendsData, isLoading, error } = useQuery<TrendsResponse>({
    queryKey: ["market-trends"],
    queryFn: async () => {
      const res = await fetch("/api/market/trends?fishName=রুই&days=7");
      if (!res.ok) throw new Error("Failed to fetch market trends");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="bg-[var(--surface)] border border-[var(--border)] p-6">
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
          </div>
        </Card>
      </div>
    );
  }

  if (error || !trendsData?.trends || trendsData.trends.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="bg-[var(--surface)] border border-[var(--border)] p-6">
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-[var(--text)]/60 font-hind">
              বাজার দর তথ্য লোড করতে ব্যর্থ হয়েছে
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const priceData: PriceData[] = trendsData.trends.map((trend) => ({
    day: getDayName(trend.date),
    price: trend.avgPrice,
  }));

  const trend = calculateTrend(priceData);
  const maxPrice = Math.max(...priceData.map((d) => d.price));
  const minPrice = Math.min(...priceData.map((d) => d.price));

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="bg-[var(--surface)] border border-[var(--border)] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text)] font-hind">
                বাজার দর পূর্বাভাস
              </h3>
              <p className="text-xs text-[var(--text)]/60 font-hind">
                ৭ দিনের মাছের দর পরিবর্তন
              </p>
            </div>
          </div>
          <div
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
              trend.isUp
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {trend.isUp ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownRight size={16} />
            )}
            <span className="text-sm font-bold font-hind">
              {trend.percentage.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm font-hind">
            <div className="flex items-center gap-2">
              <Fish size={16} className="text-[var(--primary)]" />
              <span className="text-[var(--text)]/80">রুই মাছ</span>
            </div>
            <span className="font-bold text-[var(--text)]">
              {formatBDT(priceData[priceData.length - 1].price)} / কেজি
            </span>
          </div>

          <div className="h-32 flex items-end gap-2">
            {priceData.map((data, index) => {
              const height = maxPrice > minPrice ? ((data.price - minPrice) / (maxPrice - minPrice)) * 100 : 50;
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-1 group"
                >
                  <div className="relative w-full">
                    <div
                      className="w-full bg-[var(--primary)]/20 rounded-t-sm transition-all duration-300 group-hover:bg-[var(--primary)]/40"
                      style={{ height: `${height}%` }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--text)] text-[var(--background)] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-hind">
                      {formatBDT(data.price)}
                    </div>
                  </div>
                  <span className="text-xs text-[var(--text)]/60 font-hind">
                    {data.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
            <div className="text-xs text-[var(--text)]/60 font-hind">
              সর্বোচ্চ: {formatBDT(maxPrice)} | সর্বনিম্ন: {formatBDT(minPrice)}
            </div>
            <div className="text-xs text-[var(--text)]/60 font-hind">
              গত ৭ দিনের তথ্য
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
