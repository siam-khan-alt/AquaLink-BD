import { ArrowRight, Activity } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/shared/lib/db";
import { MarketPrice } from "@/models/MarketPrice";
import { IMarketPrice } from "@/shared/types/market";
import MarketTickerClient from "./MarketTickerClient";

export default async function MarketSnapshot() {
  await connectDB();

  // ১. নির্দিষ্ট ৫টি মাছের ডাটা খোঁজা
  const targetNames = [
    "ইলিশ (১ কেজি+ সাইজ - প্রতি কেজি)",
    "রুই (১ কেজি)",
    "পাঙাশ (১ কেজি)",
    "গলদা চিংড়ি (১ কেজি)",
    "কাতলা (১ কেজি+)",
  ];

  let rawTopFishes = await MarketPrice.aggregate([
    { $match: { fishName: { $in: targetNames } } },
    { $sort: { lastUpdated: -1 } },
    { $group: { _id: "$fishName", doc: { $first: "$$ROOT" } } },
    { $replaceRoot: { newRoot: "$doc" } },
  ]);

  // ২. যদি ৫টি মাছ না পাওয়া যায়, তবে অন্য যেকোনো মাছ দিয়ে ৫টি পূর্ণ করা
  if (rawTopFishes.length < 5) {
    const existingNames = rawTopFishes.map((f) => f.fishName);
    const additionalFishes = await MarketPrice.aggregate([
      { $match: { fishName: { $nin: existingNames } } },
      { $sort: { lastUpdated: -1 } },
      { $limit: 5 - rawTopFishes.length },
    ]);
    rawTopFishes = [...rawTopFishes, ...additionalFishes];
  }

  const topFishes: IMarketPrice[] = JSON.parse(JSON.stringify(rawTopFishes));

  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-[11px] font-black uppercase tracking-widest">
            <Activity size={12} className="animate-pulse" /> সরাসরি বাজার দর
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
            আজকের <span className="text-[var(--primary)] ">সেরা দর</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Side */}
          <div className="lg:col-span-7 flex flex-col order-2 lg:order-1 h-full min-h-[400px] lg:min-h-[600px]">
            <ul className="flex-1 flex flex-col gap-3 h-full">
              {topFishes.map((fish, index) => (
                <li key={fish._id} className="flex-1">
                  <MarketTickerClient fish={fish} index={index} />
                </li>
              ))}
            </ul>

            <div className="pt-6">
              <Link
                href="/market-prices"
                className="group inline-flex items-center gap-3 text-[var(--primary)] font-black text-sm tracking-widest transition-all"
              >
                সবগুলো মাছের দাম দেখুন
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-2 transition-transform"
                />
              </Link>
            </div>
          </div>

          {/* Right Side */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="relative h-full min-h-[400px] lg:min-h-[600px] w-full rounded-2xl overflow-hidden border border-[var(--border)] group shadow-2xl">
              <Image
                src="/images/fish-market.png"
                alt="মাছের বাজার"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-1000"
                priority
              />
              <h3 className="absolute top-6 left-6 right-6 text-[var(--primary)]  font-bold mt-3 lg:text-5xl text-3xl tracking-tighter leading-tight">
                প্রতিদিনের টাটকা বাজার
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
