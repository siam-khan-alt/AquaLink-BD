/**
 * PondList Component
 * Displays list of ponds with key information
 */

import React from "react";
import { MapPin, Fish, Calendar } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { IPond } from "@/models/Pond";
import { calculatePondHealth } from "../lib/farm-logic";

interface PondListProps {
  ponds: IPond[];
  isLoading: boolean;
  onAddPond: () => void;
}

export const PondList: React.FC<PondListProps> = ({
  ponds,
  isLoading,
  onAddPond,
}) => {
  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-64 bg-[var(--border)] rounded"></div>
      </Card>
    );
  }

  if (!ponds || ponds.length === 0) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-xl font-bold text-[var(--text)] font-hind mb-2">
          কোনো পুকুর নেই
        </h3>
        <p className="text-sm text-[var(--text)]/60 font-hind mb-4">
          আপনার প্রথম পুকুর যোগ করুন
        </p>
        <Button onClick={onAddPond}>পুকুর যোগ করুন</Button>
      </Card>
    );
  }

  const getPHStatus = (ph: number): { label: string; color: string } => {
    if (ph >= 6.5 && ph <= 8.5) {
      return { label: "স্বাভাবিক", color: "text-green-500" };
    }
    if (ph >= 6.0 && ph <= 9.0) {
      return { label: "মোটামুটি", color: "text-yellow-500" };
    }
    return { label: "সমস্যাজনক", color: "text-red-500" };
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--text)] font-hind">
          পুকুর তালিকা
        </h2>
        <Button onClick={onAddPond}>পুকুর যোগ করুন</Button>
      </div>

      <div className="space-y-4">
        {ponds.map((pond) => {
          const healthScore = calculatePondHealth(pond.waterQuality);
          const phStatus = getPHStatus(pond.waterQuality.pH);

          return (
            <div
              key={pond._id.toString()}
              className="p-4 bg-[var(--surface)] rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-[var(--text)] font-hind">
                      {pond.name}
                    </h3>
                    <span className="text-xs px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full font-bold font-hind">
                      {healthScore}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-[var(--text)]/80">
                      <MapPin size={16} />
                      <span className="font-hind">
                        {pond.area} শতাংশ
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text)]/80">
                      <Fish size={16} />
                      <span className="font-hind">
                        {pond.fishType.join(", ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text)]/80">
                      <Calendar size={16} />
                      <span className="font-hind">
                        {new Date(pond.createdAt).toLocaleDateString("bn-BD")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-[var(--text)]/60 font-hind">pH:</span>
                      <span className="font-bold font-hind">
                        {pond.waterQuality.pH.toFixed(1)}
                      </span>
                      <span className={phStatus.color + " font-hind"}>
                        ({phStatus.label})
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[var(--text)]/60 font-hind">
                        DO:
                      </span>
                      <span className="font-bold font-hind">
                        {pond.waterQuality.dissolvedO2.toFixed(1)} mg/L
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
