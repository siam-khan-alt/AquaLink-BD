"use client";

import { memo, useState, useEffect } from "react";
import Image from "next/image";
import { TriangleAlert, Radio, ShieldAlert } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { Card, Chip } from "@heroui/react";

interface Alert {
  _id?: string;
  region: string;
  title: string;
  detail: string;
  level: "info" | "warning" | "danger";
  isActive: boolean;
  createdAt: string | Date;
}

async function fetchActiveAlerts(): Promise<Alert[]> {
  try {
    const res = await fetch("/api/alerts", { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 15, staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 12 } },
};

const rightPanelVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { delay: 0.2, duration: 0.5 } },
};

const AlertCard = memo(({ alert }: { alert: Alert }) => {
  const isHigh = alert.level === "danger";

  return (
    <motion.div variants={itemVariants}>
      <Card
        className={`p-4 border transition-all duration-300 backdrop-blur-md shadow-sm ${
          isHigh
            ? "border-red-500/30 bg-gradient-to-r from-red-500/10 to-transparent text-red-200"
            : "border-orange-500/20 bg-gradient-to-r from-orange-500/5 to-transparent text-orange-200"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${isHigh ? "bg-red-500 animate-ping" : "bg-orange-500"}`} />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{alert.region}</p>
            </div>
            <h4 className="text-lg font-black tracking-tight text-[var(--text)]">{alert.title}</h4>
            <p className="text-sm font-medium opacity-70 leading-relaxed text-[var(--text)]/80">{alert.detail}</p>
          </div>

          <Chip
            size="sm"
            variant="soft"
            className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 shrink-0 ${
              isHigh ? "bg-red-500/10 text-red-400" : "bg-orange-500/10 text-orange-400"
            }`}
          >
            {isHigh ? "High Threat" : "Medium"}
          </Chip>
        </div>
      </Card>
    </motion.div>
  );
});
AlertCard.displayName = "AlertCard";

export default function EmergencyDiseaseAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    fetchActiveAlerts()
      .then(setAlerts)
      .catch((error) => {
        console.error("Failed to fetch alerts:", error);
        setAlerts([]);
      });
  }, []);

  return (
    <motion.section initial="hidden" animate="visible" variants={containerVariants} className="w-full">
      <Card className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/40 dark:bg-[var(--surface)]/[0.03] backdrop-blur-xl shadow-2xl p-6 md:p-8 overflow-hidden">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <header className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Chip
                    size="sm"
                    variant="soft"
                    className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-black uppercase tracking-widest shadow-inner px-2.5"
                  >
                    Live Broadcast
                  </Chip>
                  <Radio size={14} className="text-red-500 animate-pulse" />
                </div>
                <h3 className="text-3xl font-black tracking-tighter text-[var(--text)] mt-1">
                  জরুরী রোগ সতর্কতা
                </h3>
                <p className="text-sm font-bold opacity-60">অঞ্চলভিত্তিক রিয়েল-টাইম বায়ো-ঝুঁকি ট্র্যাকিং প্যানেল।</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/5 shrink-0">
                <TriangleAlert size={22} className="animate-pulse" />
              </div>
            </header>

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-red-500/20">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <AlertCard key={alert._id || alert.title} alert={alert} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-[var(--border)]/60 bg-black/5 dark:bg-white/[0.01]">
                  <ShieldAlert size={36} className="text-[var(--text)]/20 mb-2" />
                  <p className="text-sm font-bold opacity-40">এই মুহূর্তে কোনো সক্রিয় ইমার্জেন্সি অ্যালার্ট নেই।</p>
                </div>
              )}
            </div>
          </div>

          
          <motion.div 
            variants={rightPanelVariants}
            className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-red-500/10 bg-black/20 dark:bg-black/40 min-h-[260px] lg:min-h-full flex items-center justify-center p-6 group shadow-inner"
          >
            <div className="absolute inset-0 z-0 opacity-90 dark:opacity-60 group-hover:scale-105 transition-transform duration-1000 mix-blend-screen">
              <Image
                src="/images/disease-radar.png"
                alt="Cybernetic Bio-Hazard Disease Grid Overlay"
                fill
                sizes="(min-width: 1024px) 35vw, 100vw"
                className="object-cover object-center"
                loading="lazy"
              />
            </div>

            <div className="relative z-20 w-full text-center space-y-2 mt-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider mx-auto backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                SECURE RADAR SYSTEM ACTIVE
              </div>
              <p className="text-xs font-bold opacity-40 tracking-wide">মৎস্য খামার বায়োসিকিউরিটি প্রোটোকল v2.4</p>
            </div>
          </motion.div>

        </div>
      </Card>
    </motion.section>
  );
}