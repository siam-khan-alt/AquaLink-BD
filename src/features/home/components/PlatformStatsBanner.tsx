"use client";

import React from "react";
import { Users, Waves, MessageSquare, TrendingUp } from "lucide-react";
import { Card } from "@heroui/react";
import { motion } from "framer-motion";

interface StatItem {
  icon: React.ReactNode;
  value: string;
  label: string;
  trend?: string;
}

const stats: StatItem[] = [
  { icon: <Users size={28} />, value: "৫,০০০+", label: "নিবন্ধিত চাষি", trend: "+১২%" },
  { icon: <Waves size={28} />, value: "১২,০০০+", label: "সক্রিয় পুকুর", trend: "+৮%" },
  { icon: <MessageSquare size={28} />, value: "২৫,০০০+", label: "AI পরামর্শ", trend: "+১৫%" },
  { icon: <TrendingUp size={28} />, value: "৯৫%", label: "সন্তুষ্ট ব্যবহারকারী", trend: "+৫%" },
];

export default function PlatformStatsBanner() {
  return (
    <section className="w-full py-12 bg-[var(--surface)] border-y border-[var(--border)]/30 rounded-2xl">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-[var(--background)] border-none shadow-none hover:shadow-lg transition-shadow duration-300">
                {/* এখানে CardBody এর বদলে সরাসরি div ব্যবহার করা হয়েছে */}
                <div className="flex flex-col items-center text-center p-6 gap-2">
                  <div className="p-3 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] mb-2">
                    {stat.icon}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-[var(--text)] tracking-tight">
                    {stat.value}
                  </h3>
                  <p className="text-sm font-medium text-[var(--text)]/60 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <div className="mt-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold flex items-center gap-1">
                    <TrendingUp size={12} />
                    {stat.trend}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}