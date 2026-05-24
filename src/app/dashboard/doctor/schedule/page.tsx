"use client";

import React, { useState } from "react";
import { Clock, ToggleLeft, ToggleRight, Calendar, Save } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface WeeklySchedule {
  monday: { start: string; end: string; enabled: boolean };
  tuesday: { start: string; end: string; enabled: boolean };
  wednesday: { start: string; end: string; enabled: boolean };
  thursday: { start: string; end: string; enabled: boolean };
  friday: { start: string; end: string; enabled: boolean };
  saturday: { start: string; end: string; enabled: boolean };
  sunday: { start: string; end: string; enabled: boolean };
}

export default function DoctorSchedule() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [schedule, setSchedule] = useState<WeeklySchedule>({
    monday: { start: "09:00", end: "17:00", enabled: true },
    tuesday: { start: "09:00", end: "17:00", enabled: true },
    wednesday: { start: "09:00", end: "17:00", enabled: true },
    thursday: { start: "09:00", end: "17:00", enabled: true },
    friday: { start: "09:00", end: "17:00", enabled: true },
    saturday: { start: "09:00", end: "13:00", enabled: true },
    sunday: { start: "", end: "", enabled: false },
  });

  const days = [
    { key: "monday", label: "সোমবার" },
    { key: "tuesday", label: "মঙ্গলবার" },
    { key: "wednesday", label: "বুধবার" },
    { key: "thursday", label: "বৃহস্পতিবার" },
    { key: "friday", label: "শুক্রবার" },
    { key: "saturday", label: "শনিবার" },
    { key: "sunday", label: "রবিবার" },
  ] as const;

  const handleDayToggle = (day: keyof WeeklySchedule) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
      },
    }));
  };

  const handleTimeChange = (day: keyof WeeklySchedule, field: "start" | "end", value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    // TODO: Save to backend
    console.log("Saving schedule:", { isAvailable, schedule });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[var(--text)] font-hind">
          সময়সূচি
        </h1>
        <p className="text-sm text-[var(--text)]/60 font-hind mt-1">
          আপনার কাজের সময় এবং উপলব্ধতা সেট করুন
        </p>
      </div>

      {/* Availability Toggle */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isAvailable ? "bg-green-500/10" : "bg-red-500/10"}`}>
              <Clock size={24} className={isAvailable ? "text-green-500" : "text-red-500"} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text)] font-hind">
                উপলব্ধতা স্ট্যাটাস
              </h3>
              <p className="text-sm text-[var(--text)]/60 font-hind">
                {isAvailable ? "এখন উপলব্ধ" : "এখন ব্যস্ত"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAvailable(!isAvailable)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              isAvailable ? "bg-green-500" : "bg-red-500"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                isAvailable ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Weekly Schedule */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[var(--primary)]/10 rounded-xl">
            <Calendar size={24} className="text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text)] font-hind">
              সাপ্তাহিক সময়সূচি
            </h3>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              প্রতিদিনের কাজের সময় সেট করুন
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {days.map((day) => (
            <div key={day.key} className="flex items-center gap-4 p-4 bg-[var(--background)] rounded-xl border border-[var(--border)]">
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => handleDayToggle(day.key)}
                  className={`p-2 rounded-lg transition-colors ${
                    schedule[day.key].enabled
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "bg-[var(--border)] text-[var(--text)]/40"
                  }`}
                >
                  {schedule[day.key].enabled ? (
                    <ToggleRight size={20} />
                  ) : (
                    <ToggleLeft size={20} />
                  )}
                </button>
                <span className="text-sm font-bold text-[var(--text)] font-hind w-24">
                  {day.label}
                </span>
              </div>

              {schedule[day.key].enabled && (
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-1">
                    <label className="text-xs text-[var(--text)]/60 font-hind mb-1 block">
                      শুরু
                    </label>
                    <input
                      type="time"
                      value={schedule[day.key].start}
                      onChange={(e) => handleTimeChange(day.key, "start", e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-[var(--text)]/60 font-hind mb-1 block">
                      শেষ
                    </label>
                    <input
                      type="time"
                      value={schedule[day.key].end}
                      onChange={(e) => handleTimeChange(day.key, "end", e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>
              )}

              {!schedule[day.key].enabled && (
                <div className="flex-1 text-sm text-[var(--text)]/40 font-hind">
                  বন্ধ
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSave}
            className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white px-6 py-2 rounded-lg font-hind font-bold flex items-center gap-2"
          >
            <Save size={16} />
            সংরক্ষণ করুন
          </Button>
        </div>
      </Card>
    </div>
  );
}
