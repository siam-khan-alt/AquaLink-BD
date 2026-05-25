"use client";

import { memo, useState, useEffect } from "react";
import { Cloud, Droplets, Wind, Sun, CloudRain, CloudLightning, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { Card, Chip } from "@heroui/react";

export interface WeatherSnapshot {
  locationName: string;
  tempC: number;
  humidity: number;
  windMs: number;
  condition: string;
}

const DHAKA = { lat: 23.8103, lon: 90.4125, name: "ঢাকা" };

const staticFallback: WeatherSnapshot = {
  locationName: DHAKA.name,
  tempC: 30,
  humidity: 70,
  windMs: 3,
  condition: "Clear",
};

async function fetchWeatherSnapshot(): Promise<WeatherSnapshot> {
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
  if (!apiKey) return staticFallback;

  try {
    const url = new URL("https://api.openweathermap.org/data/2.5/weather");
    url.searchParams.set("lat", String(DHAKA.lat));
    url.searchParams.set("lon", String(DHAKA.lon));
    url.searchParams.set("appid", apiKey);
    url.searchParams.set("units", "metric");

    const res = await fetch(url.toString());
    if (!res.ok) return staticFallback;

    const json = (await res.json()) as {
      name?: string;
      main?: { temp?: number; humidity?: number };
      wind?: { speed?: number };
      weather?: Array<{ main?: string }>;
    };

    return {
      locationName: json.name || DHAKA.name,
      tempC: Math.round(json.main?.temp ?? 30),
      humidity: Math.round(json.main?.humidity ?? 70),
      windMs: Number(json.wind?.speed ?? 3),
      condition: json.weather?.[0]?.main ?? "Clear",
    };
  } catch {
    return staticFallback;
  }
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15, staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 120, damping: 12 } },
};

function getAdvisory(tempC: number, humidity: number): { title: string; detail: string; status: "warning" | "success" } {
  if (tempC >= 32 && humidity >= 70) {
    return {
      title: "অতিরিক্ত তাপমাত্রা",
      detail: "অক্সিজেন কমার ঝুঁকি থাকে। সকালে অ্যারেশন দিন এবং খাবার ভাগ করে দিন।",
      status: "warning",
    };
  }
  if (tempC <= 22) {
    return {
      title: "নিম্ন তাপমাত্রা",
      detail: "রোগ সংক্রমণ বাড়তে পারে। পানি স্থিতিশীল রাখুন এবং খাবার কমিয়ে দিন।",
      status: "warning",
    };
  }
  if (humidity >= 80) {
    return {
      title: "উচ্চ আর্দ্রতা",
      detail: "পানি দূষণ দ্রুত হতে পারে। চুন প্রয়োগ ও আংশিক পানি পরিবর্তন বিবেচনা করুন।",
      status: "warning",
    };
  }
  return {
    title: "পরিবেশ স্বাভাবিক",
    detail: "দৈনিক পর্যবেক্ষণ চালিয়ে যান এবং পানির স্বচ্ছতা ও গন্ধ নিয়মিত নোট করুন।",
    status: "success",
  };
}

const WeatherIcon = memo(({ condition }: { condition: string }) => {
  const cond = condition.toLowerCase();
  if (cond.includes("rain") || cond.includes("drizzle")) return <CloudRain size={24} className="animate-bounce" />;
  if (cond.includes("thunderstorm")) return <CloudLightning size={24} className="animate-pulse" />;
  if (cond.includes("clear") || cond.includes("sun")) return <Sun size={24} className="animate-spin [animation-duration:15s]" />;
  return <Cloud size={24} />;
});
WeatherIcon.displayName = "WeatherIcon";

const Metric = memo(({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <motion.div variants={itemVariants} className="rounded-2xl bg-[var(--background)]/40 dark:bg-black/20 p-4 flex items-center justify-between border border-[var(--border)]/60 backdrop-blur-md shadow-sm">
    <div className="flex items-center gap-3">
      <span className="text-[var(--primary)]">{icon}</span>
      <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text)]/40">{label}</span>
    </div>
    <span className="text-xl font-black text-[var(--text)] tracking-tight">{value}</span>
  </motion.div>
));
Metric.displayName = "Metric";

export default function WeatherCropAdvisory() {
  const [weather, setWeather] = useState<WeatherSnapshot>(staticFallback);

  useEffect(() => {
    fetchWeatherSnapshot().then(setWeather);
  }, []);

  const advisory = getAdvisory(weather.tempC, weather.humidity);

  return (
    <motion.section initial="hidden" animate="visible" variants={containerVariants} className="w-full">
      <Card className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/40 dark:bg-[var(--surface)]/[0.03] backdrop-blur-xl shadow-2xl p-6 md:p-8 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <header className="space-y-2">
              <div className="flex items-center gap-2">
                <Chip
                  size="sm"
                  variant="soft"
                  className="bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 text-[10px] font-black uppercase tracking-widest shadow-inner px-2.5"
                >
                  Weather Advisory
                </Chip>
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--secondary)] animate-pulse" />
                <span className="text-xs font-bold text-[var(--text)]/50">{weather.condition}</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-black tracking-tighter text-[var(--text)] flex items-center gap-3">
                {weather.locationName} <span className="text-[var(--text)]/30 font-light">|</span> <span className="text-[var(--primary)]">{weather.tempC}°C</span>
              </h3>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Metric icon={<WeatherIcon condition={weather.condition} />} label="তাপমাত্রা" value={`${weather.tempC}°C`} />
              <Metric icon={<Droplets size={18} />} label="আর্দ্রতা" value={`${weather.humidity}%`} />
              <Metric icon={<Wind size={18} />} label="বাতাস" value={`${weather.windMs} m/s`} />
            </div>
          </div>

          <div className="lg:col-span-5 h-full">
            <motion.div
              variants={itemVariants}
              className={`rounded-2xl border p-5 flex flex-col justify-between h-full space-y-4 backdrop-blur-md shadow-inner transition-colors duration-300 ${
                advisory.status === "warning"
                  ? "bg-amber-500/5 border-amber-500/20 text-amber-200"
                  : "bg-emerald-500/5 border-emerald-500/20 text-emerald-200"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2 rounded-xl flex-shrink-0 ${
                  advisory.status === "warning" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                }`}>
                  {advisory.status === "warning" ? <AlertCircle size={20} className="animate-pulse" /> : <CheckCircle2 size={20} />}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest opacity-40">SMART পরামর্শ প্যানেল</p>
                  <h4 className="text-lg font-black tracking-tight text-[var(--text)]">{advisory.title}</h4>
                </div>
              </div>
              <p className="text-sm font-medium leading-relaxed text-[var(--text)]/80">
                {advisory.detail}
              </p>
            </motion.div>
          </div>

        </div>
      </Card>
    </motion.section>
  );
}