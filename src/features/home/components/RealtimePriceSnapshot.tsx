import { Layers, MoveRight } from "lucide-react";
import Link from "next/link";
import type { IMarketPrice } from "@/shared/types/market";
import { getCategorySnapshot } from "../services/marketQueries";

const CATEGORY_LABEL: Record<string, string> = {
  carp: "কার্প",
  catfish: "ক্যাটফিশ",
  prawn: "চিংড়ি",
  others: "অন্যান্য",
};

export default async function RealtimePriceSnapshot() {
  const items = await getCategorySnapshot(5);

  return (
    <section aria-labelledby="snapshot-heading" className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-[11px] font-black uppercase tracking-widest">
            <Layers size={14} />
            Realtime Snapshot
          </div>
          <h2 id="snapshot-heading" className="text-3xl md:text-5xl font-black tracking-tighter">
            ক্যাটাগরি ভিত্তিক <span className="text-[var(--primary)]">দর</span>
          </h2>
          <p className="text-sm font-bold opacity-50 max-w-2xl">
            প্রতিটি ক্যাটাগরির সর্বশেষ আপডেটেড আইটেম দ্রুত দেখে নিন।
          </p>
        </div>

        <Link
          href="/market-prices"
          className="inline-flex items-center gap-2 text-[var(--primary)] font-black text-sm tracking-widest"
        >
          বিস্তারিত
          <MoveRight size={18} />
        </Link>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {items.map((i: IMarketPrice) => (
          <article
            key={i._id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm hover:border-[var(--primary)]/30 transition-colors"
          >
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
              {CATEGORY_LABEL[i.category] ?? "ক্যাটাগরি"}
            </p>
            <h3 className="mt-2 font-black text-lg tracking-tight line-clamp-2 min-h-[3rem]">
              {i.fishName}
            </h3>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">দর</p>
                <p className="text-3xl font-black tracking-tighter">
                  <span className="text-sm text-[var(--primary)] font-black">৳</span> {i.currentPrice}
                </p>
              </div>
              <p className="text-xs font-bold opacity-40">{i.location}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

