"use client";
import {
  Search,
  ShieldAlert,
  FlaskConical,
  Stethoscope,
  Info,
  Camera,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { DISEASES } from "../data/diseases";
import Image from "next/image";
import { useDiseaseStore } from "@/shared/hooks/useDiseaseStore";

export default function DiseaseGuideUI() {
  const { searchQuery, setSearchQuery } = useDiseaseStore();

  const filteredData = DISEASES.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.fishType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-16">
      {/* Search & AI */}
      <section className="flex flex-col md:flex-row gap-6 items-center bg-[var(--surface)]/30 p-4 rounded-2xl border border-[var(--border)]/50 shadow-inner">
        <div className="flex-1 w-full">
          <Input
            label="রোগ বা মাছের নাম অনুসন্ধান করুন"
            placeholder="যেমন: ক্ষত রোগ, রুই মাছ..."
            icon={<Search size={20} />}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-4 p-4 pr-10 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-emerald-500 text-black cursor-pointer shadow-lg w-full md:w-auto"
        >
          <div className="p-3 bg-white/30 rounded-xl backdrop-blur-md">
            <Camera size={24} strokeWidth={3} />
          </div>
          <div className="whitespace-nowrap">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-80 leading-none">
              AI Detector
            </p>
            <h4 className="font-black text-md mt-1 tracking-tight">
              ছবি তুলে রোগ শনাক্ত করুন
            </h4>
          </div>
        </motion.div>
      </section>

      {/* Disease List */}
      <div className="space-y-32 py-10">
        <AnimatePresence mode="popLayout">
          {filteredData.length > 0 ? (
            filteredData.map((disease, index) => (
              <motion.div
                layout
                key={disease._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`flex flex-col md:flex-row gap-10 md:items-stretch ${
                  index % 2 !== 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="relative w-full md:w-1/2 min-h-[350px] md:min-h-full rounded-2xl overflow-hidden group shadow-2xl border border-white/5">
                  <Image
                    src={disease.imageUrl}
                    alt={disease.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    priority={index < 2}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="px-4 py-1.5 bg-black/60 backdrop-blur-xl rounded-xl text-[10px] font-black text-[var(--primary)] border border-[var(--primary)]/20 uppercase tracking-widest self-start">
                      {disease.fishType}
                    </span>
                    <span
                      className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border self-start ${
                        disease.riskLevel === "high"
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      }`}
                    >
                      {disease.riskLevel === "high"
                        ? "High Risk"
                        : "Medium Risk"}
                    </span>
                  </div>
                </div>

                {/* Information */}
                <div className="w-full md:w-1/2 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-4xl lg:text-5xl font-black tracking-tighter text-[var(--text)] leading-none">
                      {disease.name}
                    </h3>
                    <p className="text-lg font-medium opacity-60 leading-relaxed border-l-4 border-[var(--primary)]/50 pl-4">
                      {disease.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-400 flex items-center gap-2">
                        <Zap size={16} className="fill-current" /> কেন হয়?
                      </h5>
                      <ul className="text-sm space-y-2 opacity-50 font-bold">
                        {disease.causes.map((c, i) => (
                          <li key={i} className="flex gap-2">
                            <span>•</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2">
                        <ShieldAlert size={16} /> প্রতিরোধ
                      </h5>
                      <ul className="text-sm space-y-2 opacity-50 font-bold">
                        {disease.prevention.map((p, i) => (
                          <li key={i} className="flex gap-2">
                            <span>•</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-5 rounded-2xl bg-[var(--primary)]/5 border border-[var(--primary)]/10">
                      <div className="flex items-center gap-3 mb-2">
                        <Stethoscope
                          className="text-[var(--primary)]"
                          size={20}
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--primary)]">
                          চিকিৎসা
                        </span>
                      </div>
                      <p className="text-sm font-bold leading-relaxed">
                        {disease.solution.join(". ")}।
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-cyan-400/5 border border-cyan-400/10 flex flex-wrap gap-2 items-center">
                      <FlaskConical className="text-cyan-400 mr-2" size={20} />
                      {disease.medicines.map((m, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-black text-cyan-400 bg-cyan-400/10 px-3 py-1.5 rounded-lg border border-cyan-400/20 uppercase"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                    <Info size={14} />
                    <p className="text-[10px] font-bold uppercase tracking-widest leading-none">
                      বিশেষজ্ঞের পরামর্শ বাধ্যতামূলক
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-40 text-center opacity-40 font-black text-2xl">
              এই নামে কোনো তথ্য পাওয়া যায়নি...
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
