/**
 * StatsCards Component
 * Displays key dashboard statistics in a grid layout
 */

import React from "react";
import { Waves, CircleDollarSign, Fish, Activity } from "lucide-react";
import Card from "@/components/ui/Card";
import { DashboardStats } from "../hooks/useDashboardStats";

interface StatsCardsProps {
  stats: DashboardStats;
  isLoading: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, isLoading }) => {
  const cards = [
    {
      title: "মোট পুকুর সংখ্যা",
      value: stats.totalPonds,
      icon: Waves,
      color: "text-[var(--primary)]",
      bgColor: "bg-[var(--primary)]/10",
    },
    {
      title: "মোট বিনিয়োগ",
      value: `৳ ${stats.totalExpenses.toLocaleString()}`,
      icon: CircleDollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "সক্রিয় মাছের প্রজাতি",
      value: stats.totalActiveSpecies,
      icon: Fish,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "গড় পানির pH মান",
      value: stats.averagePH.toFixed(2),
      icon: Activity,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-20 bg-[var(--border)] rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text)]/60 font-hind mb-2">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-[var(--text)] font-hind">
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <Icon size={24} className={card.color} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
