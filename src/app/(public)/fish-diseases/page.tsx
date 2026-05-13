import { Metadata } from "next";
import { Activity, HeartPulse } from "lucide-react";
import DiseaseGuideUI from "@/modules/fish-diseases/components/DiseaseGuideUI";

export const metadata: Metadata = {
  title: "মাছের রোগ ও সমাধান | ডিজিটাল মৎস্য সহকারী - AquaLink-BD",
  description: "মাছের সাধারণ রোগ, কারণ, প্রতিকার এবং সঠিক ওষুধ সম্পর্কে বিস্তারিত জানুন।",
};

export default function DiseasePage() {
  return (
    <main className="min-h-screen py-10 container mx-auto px-4 ">
      {/* Header */}
      <header className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-[var(--border)] pb-12">
        
        {/* Left Side */}
        <div className="text-left space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-xs font-bold uppercase tracking-widest">
            <Activity size={14} className="animate-pulse" /> স্বাস্থ্য ও সুরক্ষা গাইড
          </div>
          <div>
            <h1 className="text-5xl md:text-7xl font-black text-[var(--text)] tracking-tighter leading-tight">
              মাছের <span className="text-[var(--primary)]">রোগ ও সমাধান</span>
            </h1>
            <p className="text-lg md:text-xl font-bold opacity-50 mt-2">
              মাছকে রোগমুক্ত রাখতে সঠিক চিকিৎসা ও আধুনিক পরামর্শ।
            </p>
          </div>
        </div>

        {/* Right Side: Stats Cards */}
        <section className="grid grid-cols-2  gap-4 w-full lg:w-auto">
         
          <StatCard 
            icon={<HeartPulse className="text-emerald-500" size={20} />} 
            label="প্রধান রোগ" 
            value="১০+ আইটেম" 
          />
          <StatCard 
            className="hidden sm:block"
            icon={<Activity className="opacity-50" size={20} />} 
            label="আপডেট" 
            value="লাইভ গাইড" 
          />
        </section>
      </header>
      <DiseaseGuideUI />
    </main>
  );
}


const StatCard = ({ icon, label, value, className = "" }: { icon: React.ReactNode; label: string; value: string; className?: string; }) => (
  <div className={`bg-[var(--surface)] border border-[var(--border)] p-5 rounded-2xl shadow-sm hover:border-[var(--primary)]/30 transition-all group ${className}`}>
    <div className="mb-2 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <p className="text-[10px] font-black uppercase opacity-40 mb-1 tracking-widest">{label}</p>
    <p className="text-xl font-black whitespace-nowrap">{value}</p>
  </div>
);