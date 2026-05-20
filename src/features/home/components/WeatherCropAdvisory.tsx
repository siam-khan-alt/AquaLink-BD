import { Cloud, Droplets, Wind } from "lucide-react";
import { getWeatherSnapshot } from "../services/weatherService";

function getAdvisory(tempC: number, humidity: number): { title: string; detail: string } {
  // Minimal logic, maximum impact: actionable hints for pond management.
  if (tempC >= 32 && humidity >= 70) {
    return {
      title: "তাপমাত্রা বেশি",
      detail: "অক্সিজেন কমার ঝুঁকি থাকে। সকালে অ্যারেশন দিন এবং খাবার ভাগ করে দিন।",
    };
  }
  if (tempC <= 22) {
    return {
      title: "তাপমাত্রা কম",
      detail: "রোগ সংক্রমণ বাড়তে পারে। পানি স্থিতিশীল রাখুন এবং খাবার কমিয়ে দিন।",
    };
  }
  if (humidity >= 80) {
    return {
      title: "আর্দ্রতা বেশি",
      detail: "পানি দূষণ দ্রুত হতে পারে। চুন প্রয়োগ ও আংশিক পানি পরিবর্তন বিবেচনা করুন।",
    };
  }
  return {
    title: "পরিস্থিতি স্বাভাবিক",
    detail: "দৈনিক পর্যবেক্ষণ চালিয়ে যান এবং পানির স্বচ্ছতা/গন্ধ নোট করুন।",
  };
}

export default async function WeatherCropAdvisory() {
  const w = await getWeatherSnapshot();
  const advisory = getAdvisory(w.tempC, w.humidity);

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Weather Advisory</p>
          <h3 className="text-2xl font-black tracking-tight mt-1">
            {w.locationName} — {advisory.title}
          </h3>
          <p className="text-sm font-bold opacity-60 mt-2">{advisory.detail}</p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)]">
          <Cloud size={20} />
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Metric icon={<Cloud size={16} />} label="তাপমাত্রা" value={`${w.tempC}°C`} />
        <Metric icon={<Droplets size={16} />} label="আর্দ্রতা" value={`${w.humidity}%`} />
        <Metric icon={<Wind size={16} />} label="বাতাস" value={`${w.windMs} m/s`} />
      </div>
    </section>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="text-[var(--primary)]">{icon}</span>
        <span className="text-xs font-black uppercase tracking-widest opacity-50">{label}</span>
      </div>
      <span className="text-lg font-black">{value}</span>
    </div>
  );
}

