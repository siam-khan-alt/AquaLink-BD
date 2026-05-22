"use client";

import React from "react";
import { Users, Waves, MessageSquare, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";

interface StatItem {
  icon: React.ReactNode;
  value: string;
  label: string;
  trend?: string;
}

const mockStats: StatItem[] = [
  {
    icon: <Users size={24} />,
    value: "৫,০০০+",
    label: "নিবন্ধিত চাষি",
    trend: "+১২% গত মাসে",
  },
  {
    icon: <Waves size={24} />,
    value: "১২,০০০+",
    label: "সক্রিয় পুকুর",
    trend: "+৮% গত মাসে",
  },
  {
    icon: <MessageSquare size={24} />,
    value: "২৫,০০০+",
    label: "AI পরামর্শ",
    trend: "+১৫% গত মাসে",
  },
  {
    icon: <TrendingUp size={24} />,
    value: "৯৫%",
    label: "সন্তুষ্ট ব্যবহারকারী",
    trend: "+৫% গত মাসে",
  },
];

export default function PlatformStatsBanner() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="bg-[var(--surface)] border border-[var(--border)] p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockStats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all duration-300"
            >
              <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl mb-3">
                {stat.icon}
              </div>
              <h3 className="text-2xl font-black text-[var(--text)] mb-1 font-hind">
                {stat.value}
              </h3>
              <p className="text-sm text-[var(--text)]/80 font-semibold font-hind mb-2">
                {stat.label}
              </p>
              {stat.trend && (
                <div className="flex items-center gap-1 text-xs text-[var(--primary)] font-bold font-hind">
                  <TrendingUp size={12} />
                  <span>{stat.trend}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
