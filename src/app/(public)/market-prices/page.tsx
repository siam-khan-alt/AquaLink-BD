import MarketUI from "@/modules/market-data/components/MarketUI";
import { MarketPrice } from "@/models/MarketPrice";
import { connectDB } from "@/shared/lib/db";
import { Metadata } from "next";
import { Activity, TrendingUp, Fish } from "lucide-react";
import { IMarketPrice } from "@/shared/types/market"; // টাইপটি ইম্পোর্ট করে নিন

export const metadata: Metadata = {
  title: "বাজার দর | ঢাকা ভিত্তিক লাইভ আপডেট - মৎস্য বন্ধু",
  description: "ঢাকার পাইকারি ও খুচরা বাজারের মাছের সর্বশেষ সঠিক বাজার দর জানুন।",
};

export const revalidate = 1800;

export default async function MarketPricesPage() {
  await connectDB();

  const rawData = await MarketPrice.find().sort({ lastUpdated: -1 }).lean();
  
  const data: IMarketPrice[] = JSON.parse(JSON.stringify(rawData));

  const totalItems = data.length;
  const upTrendCount = data.filter((fish: IMarketPrice) => fish.trend === 'up').length;

  return (
    <main className="min-h-screen py-10 container mx-auto px-4">
      {/* Header */}
      <header className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-[var(--border)] pb-12">
        
        {/* Left Side */}
        <div className="text-left space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-xs font-bold uppercase tracking-widest">
            <Activity size={14} className="animate-pulse" /> লাইভ বাজার আপডেট
          </div>
          <div>
            <h1 className="text-5xl md:text-7xl font-black text-[var(--text)] tracking-tighter leading-tight">
              মাছের <span className="text-[var(--primary)]">বাজার দর</span>
            </h1>
            <p className="text-lg md:text-xl font-bold opacity-50 mt-2">
              ঢাকার পাইকারি বাজারের সঠিক তথ্য এখন আপনার হাতের মুঠোয়।
            </p>
          </div>
        </div>

        {/* Right Side */}
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full lg:w-auto">
          <StatCard 
            icon={<Fish className="text-[var(--primary)]" size={20} />} 
            label="মোট আইটেম" 
            value={`${totalItems}+ মাছ`} 
          />
          <StatCard 
            icon={<TrendingUp className="text-emerald-500" size={20} />} 
            label="দর বাড়ছে" 
            value={`${upTrendCount} টি আইটেম`} 
          />
          <StatCard 
            className="hidden sm:block"
            icon={<Activity className="opacity-50" size={20} />} 
            label="প্রধান মার্কেট" 
            value="ঢাকা ভিত্তিক" 
          />
        </section>
      </header>

      <section className="bg-[var(--surface)]/30 p-2 rounded-2xl border border-[var(--border)]/50 shadow-inner">
        <MarketUI initialData={data} />
      </section>
    </main>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}

const StatCard = ({ icon, label, value, className = "" }: StatCardProps) => (
  <div className={`bg-[var(--surface)] border border-[var(--border)] p-5 rounded-2xl shadow-sm hover:border-[var(--primary)]/30 transition-all group ${className}`}>
    <div className="mb-2 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <p className="text-[10px] font-black uppercase opacity-40 mb-1 tracking-widest">{label}</p>
    <p className="text-xl font-black whitespace-nowrap">{value}</p>
  </div>
);