"use client";

import { memo, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { TrendingUp, Scale, DollarSign, Calculator, Download, Loader2, Sparkles, Target } from "lucide-react";
import { Card, Button, Chip } from "@heroui/react";
import { motion, Variants } from "framer-motion";
import { toast } from "sonner";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

const InputSlider = memo(({ 
  label, icon, min, max, step, value, unit, onChange 
}: { 
  label: string; icon: React.ReactNode; min: number; max: number; step: number; value: number; unit: string; onChange: (val: number) => void 
}) => (
  <motion.div variants={itemVariants} className="space-y-1.5">
    <label className="flex items-center gap-2 text-[11px] font-black tracking-wider uppercase text-[var(--text)]/60">
      <span className="text-[var(--primary)]">{icon}</span>
      {label}
    </label>
    <div className="relative flex items-center gap-4 bg-[var(--background)]/40 border border-[var(--border)]/60 p-2.5 rounded-xl backdrop-blur-md">
      <input
        type="range"
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
      />
      <span className="text-xs font-black text-[var(--primary)] whitespace-nowrap bg-[var(--surface)] px-2.5 py-1 rounded-lg border border-[var(--border)]/60 shadow-sm min-w-[75px] text-center">
        {value} {unit}
      </span>
    </div>
  </motion.div>
));
InputSlider.displayName = "InputSlider";

const CalculatedRow = memo(({ label, value, className = "", isBold = false }: { label: string; value: string; className?: string; isBold?: boolean }) => (
  <div className={`flex justify-between items-center py-2 ${isBold ? "border-t border-[var(--border)]/60 pt-3 mt-1" : ""}`}>
    <span className={`text-xs ${isBold ? "font-black text-[var(--text)]" : "font-bold text-[var(--text)]/70"}`}>{label}</span>
    <span className={`tracking-tight ${isBold ? "text-lg font-black" : "text-sm font-black"} ${className}`}>{value}</span>
  </div>
));
CalculatedRow.displayName = "CalculatedRow";

export default function ProfitCalculatorWidget() {
  const [pondSize, setPondSize] = useState<number>(1);
  const [fishCount, setFishCount] = useState<number>(1000);
  const [feedCostPerKg, setFeedCostPerKg] = useState<number>(80);
  const [expectedGrowth, setExpectedGrowth] = useState<number>(500);
  const [marketPricePerKg, setMarketPricePerKg] = useState<number>(350);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const calculations = useMemo(() => {
    const totalFishWeight = (fishCount * expectedGrowth) / 1000;
    const totalRevenue = totalFishWeight * marketPricePerKg;
    const totalFeedNeeded = (fishCount * expectedGrowth * 2.5) / 1000;
    const totalFeedCost = totalFeedNeeded * feedCostPerKg;
    const otherCosts = pondSize * 5000;
    const totalCost = totalFeedCost + otherCosts;
    const netProfit = totalRevenue - totalCost;
    const roi = totalCost > 0 ? ((netProfit / totalCost) * 100) : 0;

    return { totalFishWeight, totalRevenue, totalFeedNeeded, totalFeedCost, otherCosts, totalCost, netProfit, roi };
  }, [pondSize, fishCount, feedCostPerKg, expectedGrowth, marketPricePerKg]);

  const handleDownloadPDF = useCallback(async () => {
    setIsDownloading(true);
    try {
      const response = await fetch("/api/calculator/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pondSize, fishCount, feedCostPerKg, expectedGrowth, marketPricePerKg, ...calculations }),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Fish_Profit_Report_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("রিপোর্ট ডাউনলোড সফল হয়েছে!");
    } catch {
      toast.error("রিপোর্ট ডাউনলোড ব্যর্থ হয়েছে।");
    } finally {
      setIsDownloading(false);
    }
  }, [pondSize, fishCount, feedCostPerKg, expectedGrowth, marketPricePerKg, calculations]);

  return (
    <motion.section initial="hidden" animate="visible" variants={containerVariants} className="w-full container mx-auto ">
      <Card className="backdrop-blur-xl bg-[var(--surface)]/40 dark:bg-[var(--surface)]/[0.03] border border-[var(--border)]/60 dark:border-white/5 shadow-2xl rounded-none md:rounded-3xl p-0 md:p-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 md:gap-6 items-stretch">
          
          <div className="lg:col-span-5 relative border-b md:border-b-0 lg:border border-[var(--border)] md:rounded-2xl overflow-hidden bg-black/10 dark:bg-black/40 flex flex-col justify-between p-6 group min-h-[340px] lg:min-h-full mx-0">
            <div className="absolute inset-0 z-0 opacity-50 dark:opacity-30 group-hover:scale-105 transition-transform duration-1000">
              <Image
                src="/images/smart-pond.png"
                alt="Smart Aquaculture Pond Grid"
                fill
                sizes="(min-width: 1024px) 35vw, 100vw"
                className="object-cover rounded-2xl"
                loading="lazy"
              />
            </div>

            <div className="relative z-20 space-y-3">
              <Chip
                size="sm"
                variant="soft"
                className="bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 text-[10px] font-black uppercase tracking-widest px-2.5 flex items-center gap-1.5"
              >
                <Sparkles size={11} className="inline text-[var(--secondary)]" /> Smart Analytics
              </Chip>
              <h3 className="text-3xl md:text-5xl font-black tracking-tighter text-[var(--text)] leading-none">
                সঠিক হিসাবেই <br /><span className="text-[var(--primary)]">আসবে বড় সাফল্য!</span>
              </h3>
              <p className="text-md font-bold opacity-75 leading-relaxed max-w-xs">
                অনুমানভিত্তিক চাষাবাদ বাদ দিয়ে বৈজ্ঞানিক ডাটা ও রিয়েল-টাইম হিসাবের মাধ্যমে আপনার খামারের সর্বোচ্চ লাভ নিশ্চিত করুন।
              </p>
            </div>

            <div className="relative z-20 bg-[var(--surface)]/60 dark:bg-zinc-900/60 border border-[var(--border)]/80 dark:border-white/5 p-4 rounded-xl backdrop-blur-md space-y-2 mt-auto shadow-sm">
              <div className="flex items-center gap-2 text-xs font-black text-[var(--text)]">
                <Target size={14} className="text-[var(--secondary)] animate-pulse" />
                আপনার করণীয়:
              </div>
              <p className="text-[12px] font-bold opacity-60 leading-normal">
                ডান পাশের স্লাইডারগুলো ব্যবহার করে আপনার পুকুরের সঠিক মাপ ও সংখ্যা ইনপুট দিন এবং তাৎক্ষণিক নির্ভুল ফলাফল বিশ্লেষণ দেখুন।
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-between space-y-4 p-5 md:p-0">
            <header className="flex items-center gap-3 border-b border-[var(--border)]/60 pb-3">
              <div className="p-2.5 bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 rounded-xl shadow-inner">
                <Calculator size={20} />
              </div>
              <div>
                <h4 className="text-lg font-black tracking-tight text-[var(--text)]">বিনিয়োগ ও মুনাফা নিরূপণ</h4>
                <p className="text-[11px] font-bold text-[var(--text)]/50">লাইভ অ্যালগরিদম ভিত্তিক ফিড ও ROI ক্যালকুলেশন</p>
              </div>
            </header>

            <div className="space-y-3">
              <InputSlider label="পুকুরের আকার" icon={<Scale size={14} />} min={0.5} max={10} step={0.5} value={pondSize} unit="শতাংশ" onChange={setPondSize} />
              <InputSlider label="মাছের সংখ্যা" icon={<Scale size={14} />} min={100} max={5000} step={100} value={fishCount} unit="টি" onChange={setFishCount} />
              <InputSlider label="খাবারের দাম (প্রতি কেজি)" icon={<DollarSign size={14} />} min={50} max={150} step={5} value={feedCostPerKg} unit="৳" onChange={setFeedCostPerKg} />
              <InputSlider label="প্রত্যাশিত ওজন (প্রতি মাছ)" icon={<TrendingUp size={14} />} min={200} max={1000} step={50} value={expectedGrowth} unit="গ্রাম" onChange={setExpectedGrowth} />
              <InputSlider label="বাজার মূল্য (প্রতি কেজি)" icon={<DollarSign size={14} />} min={200} max={600} step={10} value={marketPricePerKg} unit="৳" onChange={setMarketPricePerKg} />
            </div>

            <motion.div variants={itemVariants} className="bg-black/5 dark:bg-black/20 border border-[var(--border)]/60 dark:border-white/5 p-4 rounded-xl shadow-inner space-y-0.5">
              <CalculatedRow label="মোট সম্ভাব্য রাজস্ব (গ্রস আয়)" value={`${calculations.totalRevenue.toLocaleString()} ৳`} className="text-[var(--secondary)] dark:text-emerald-400" />
              <CalculatedRow label="মোট অপারেটিং ব্যয় (খরচ)" value={`${calculations.totalCost.toLocaleString()} ৳`} className="text-red-500" />
              <CalculatedRow label="প্রত্যাশিত নিট লাভ" value={`${calculations.netProfit.toLocaleString()} ৳`} className={calculations.netProfit >= 0 ? "text-[var(--secondary)] dark:text-emerald-400" : "text-red-500"} isBold />
              <CalculatedRow label="বিনিয়োগের রিটার্ন হার (ROI)" value={`${calculations.roi.toFixed(1)}%`} className={calculations.roi >= 0 ? "text-[var(--secondary)] dark:text-emerald-400" : "text-red-500"} />
            </motion.div>

            <Button
              onClick={handleDownloadPDF}
              isDisabled={isDownloading}
              className="w-full py-5 rounded-xl hidden bg-[var(--primary)] text-white font-black text-xs tracking-wider hover:opacity-95 active:scale-[0.99] transition-all shadow-lg"
            >
              {isDownloading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  রিপোর্ট তৈরি হচ্ছে...
                </>
              ) : (
                <>
                  <Download size={16} />
                  রিপোর্ট ডাউনলোড করুন (PDF)
                </>
              )}
            </Button>
          </div>

        </div>
      </Card>
    </motion.section>
  );
}