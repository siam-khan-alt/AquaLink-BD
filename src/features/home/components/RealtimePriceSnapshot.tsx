"use client";

import { memo, useMemo } from "react";
import { Layers, MoveRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Chip, Card } from "@heroui/react";
import { motion, Variants } from "framer-motion";

interface IMarketPriceSnapshot {
  _id: string;
  category: "carp" | "catfish" | "prawn" | "hilsa" | "tilapia";
  fishName: string;
  currentPrice: number;
  location: string;
}

const CATEGORY_DATA: Record<IMarketPriceSnapshot["category"], { label: string; icon: string }> = {
  carp: { label: "কার্প", icon: "/images/snapshot/carp.png" },
  catfish: { label: "ক্যাটফিশ", icon: "/images/snapshot/catfish.png" },
  prawn: { label: "চিংড়ি", icon: "/images/snapshot/prawn.png" },
  hilsa: { label: "ইলিশ", icon: "/images/snapshot/hilsa.png" },
  tilapia: { label: "তেলাপিয়া", icon: "/images/snapshot/tilapia.png" },
};

const mockItems: IMarketPriceSnapshot[] = [
  { _id: "1", category: "carp", fishName: "কার্প মাছ (১ কেজি+)", currentPrice: 320, location: "ঢাকা" },
  { _id: "2", category: "catfish", fishName: "শিং মাছ (মাঝারি)", currentPrice: 550, location: "ঢাকা" },
  { _id: "3", category: "prawn", fishName: "গলদা চিংড়ি (বড়)", currentPrice: 950, location: "ঢাকা" },
  { _id: "4", category: "hilsa", fishName: "পদ্মার ইলিশ (১ কেজি)", currentPrice: 1600, location: "ঢাকা" },
  { _id: "5", category: "tilapia", fishName: "তেলাপিয়া (মাঝারি)", currentPrice: 220, location: "ঢাকা" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring", stiffness: 110, damping: 14 } 
  },
};

const PriceCard = memo(({ item }: { item: IMarketPriceSnapshot }) => {
  const category = CATEGORY_DATA[item.category];

  return (
    <motion.article variants={cardVariants} whileHover={{ y: -6 }}>
      <Card className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 dark:bg-[var(--surface)]/[0.03] backdrop-blur-xl shadow-xl overflow-hidden h-full group transition-all duration-300 flex flex-col p-0">
        <div className="relative h-56 w-full overflow-hidden flex-shrink-0 bg-[var(--primary)]/[0.01]">
          <Image
            src={category.icon}
            alt={category.label}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
            className="object-cover rounded-2xl p-2 group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute top-4 left-4 z-10">
            <Chip
              size="sm"
              variant="soft"
              className="bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 text-[10px] font-black uppercase tracking-widest shadow-inner"
            >
              {category.label}
            </Chip>
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between -mt-6 relative z-10 space-y-4">
          <h3 className="mt-1 font-bold text-2xl tracking-tight leading-tight line-clamp-2 text-[var(--primary)] transition-colors">
            {item.fishName}
          </h3>
          <div className="pt-3 border-t border-[var(--border)]/60 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text)]/40 mb-1">দর</p>
              <p className="text-4xl font-black text-[var(--text)] tracking-tighter">
                <span className="text-sm text-[var(--primary)] font-black">৳</span> {item.currentPrice}
              </p>
            </div>
            <p className="text-xs font-bold text-[var(--text)]/60 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--secondary)] animate-pulse" />
              {item.location}
            </p>
          </div>
        </div>
      </Card>
    </motion.article>
  );
});

PriceCard.displayName = "PriceCard";

export default function RealtimePriceSnapshot() {
  const items = useMemo(() => mockItems, []);

  return (
    <section aria-labelledby="snapshot-heading" className="space-y-10 py-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border)] pb-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-[11px] font-black uppercase tracking-widest shadow-inner">
            <Layers size={14} className="animate-pulse" />
            <span>Realtime Snapshot</span>
          </div>
          <h2 id="snapshot-heading" className="text-4xl md:text-5xl text-[var(--primary)] tracking-tighter font-bold leading-tight">
            ক্যাটাগরি ভিত্তিক দর
          </h2>
          <p className="text-base font-medium text-[var(--text)]/70 max-w-3xl leading-relaxed">
            প্রতিটি ক্যাটাগরির সর্বশেষ আপডেটেড আইটেম দ্রুত দেখে নিন এবং SMART মৎস্য চাষের সিদ্ধান্ত নিন।
          </p>
        </div>

        <Link
          href="/market-prices"
          className="hidden md:inline-flex group items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-black text-[var(--text)]/90 border border-[var(--border)] bg-[var(--surface)]/5 hover:bg-[var(--surface)]/10 transition-all backdrop-blur-sm shadow-md"
        >
          আজকের বাজার দর
          <MoveRight size={18} className="text-[var(--primary)] group-hover:translate-x-1 transition-transform" />
        </Link>
      </header>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {items.map((i) => (
          <PriceCard key={i._id} item={i} />
        ))}
      </motion.div>

      <div className="flex md:hidden pt-4">
        <Link
          href="/market-prices"
          className="group w-full inline-flex items-center justify-center gap-2.5 rounded-xl px-5 py-4 text-base font-black text-[var(--text)]/90 border border-[var(--border)] bg-[var(--surface)]/5 hover:bg-[var(--surface)]/10 transition-all backdrop-blur-sm shadow-md"
        >
          আজকের বাজার দর
          <MoveRight size={18} className="text-[var(--primary)] group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}