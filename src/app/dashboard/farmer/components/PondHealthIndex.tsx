/**
 * PondHealthIndex Component
 * Displays pond health scores with predictive analytics
 */

import React from "react";
import Card from "@/components/ui/Card";
import { IPond } from "@/models/Pond";
import { calculatePondHealth } from "../lib/farm-logic";

interface PondHealthIndexProps {
  ponds: IPond[];
  isLoading: boolean;
}

export const PondHealthIndex: React.FC<PondHealthIndexProps> = ({
  ponds,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-40 bg-[var(--border)] rounded"></div>
      </Card>
    );
  }

  if (!ponds || ponds.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold text-[var(--text)] font-hind mb-4">
          পুকুর স্বাস্থ্য সূচক
        </h2>
        <p className="text-sm text-[var(--text)]/60 font-hind">
          কোনো পুকুর নেই
        </p>
      </Card>
    );
  }

  const healthScores = ponds.map((pond) => ({
    pond,
    score: calculatePondHealth(pond.waterQuality),
  }));

  const avgHealth =
    healthScores.reduce((sum, item) => sum + item.score, 0) /
    healthScores.length;

  const getHealthColor = (score: number): string => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getHealthLabel = (score: number): string => {
    if (score >= 80) return "চমৎকার";
    if (score >= 60) return "ভালো";
    if (score >= 40) return "মোটামুটি";
    return "খারাপ";
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--text)] font-hind">
          পুকুর স্বাস্থ্য সূচক
        </h2>
        <div className="text-right">
          <p className="text-sm text-[var(--text)]/60 font-hind">গড় স্বাস্থ্য</p>
          <p className={`text-2xl font-bold font-hind ${getHealthColor(avgHealth)}`}>
            {avgHealth.toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {healthScores.map(({ pond, score }) => (
          <div
            key={pond._id.toString()}
            className="flex items-center justify-between p-3 bg-[var(--surface)] rounded-lg"
          >
            <div className="flex-1">
              <p className="font-bold text-[var(--text)] font-hind">
                {pond.name}
              </p>
              <p className="text-xs text-[var(--text)]/60 font-hind">
                pH: {pond.waterQuality.pH.toFixed(1)} | DO:{" "}
                {pond.waterQuality.dissolvedO2.toFixed(1)} mg/L
              </p>
            </div>
            <div className="text-right">
              <p
                className={`text-lg font-bold font-hind ${getHealthColor(score)}`}
              >
                {score}%
              </p>
              <p className="text-xs text-[var(--text)]/60 font-hind">
                {getHealthLabel(score)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
