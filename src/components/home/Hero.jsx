"use client";
import { useLanguage } from "@/components/providers/Providers";
import { ArrowRight, CheckCircle2, ShieldCheck, Users, Zap } from "lucide-react";
import LinkNext from "next/link";

export default function Hero() {
  const { language } = useLanguage();

  const features = [
    {
      icon: <Zap className="text-[var(--primary)]" size={20} />,
      bn: "রিয়েল-টাইম মার্কেট আপডেট",
      en: "Real-time Market Updates",
    },
    {
      icon: <ShieldCheck className="text-[var(--accent)]" size={20} />,
      bn: "ভেরিফাইড বিশেষজ্ঞ পরামর্শ",
      en: "Verified Expert Advice",
    },
    {
      icon: <Users className="text-[var(--primary)]" size={20} />,
      bn: "সরাসরি বিক্রেতার সাথে যোগাযোগ",
      en: "Direct Seller Interaction",
    },
  ];

  return (
    <section className="relative w-full h-auto min-h-[550px] lg:h-[80vh] flex items-center overflow-hidden bg-[var(--background)] py-4 -mt-5 md:-mt-4">
      
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0"> 
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-50"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div 
          className="absolute inset-0 z-10" 
          style={{ background: `linear-gradient(to right, var(--overlay), transparent)` }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-20">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
          
          {/* Left Side: Text Content */}
          <div className="w-full lg:w-[65%] space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--glass)] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
              <span className="text-[var(--primary)] text-[10px] sm:text-xs font-bold tracking-widest uppercase">
                {language === "bn" ? "মৎস্য চাষের ডিজিটাল বিপ্লব" : "Digital Fishery Revolution"}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-[var(--text)] leading-tight">
              {language === "bn" ? (
                <>আপনার মৎস্য চাষে আনুন <br /><span className="brand-text">স্মার্ট সমাধান</span></>
              ) : (
                <>Bring Smart Solutions to <br /><span className="brand-text">Your Fish Farming</span></>
              )}
            </h1>

            <p className="text-base md:text-lg text-[var(--text)] opacity-90 max-w-2xl font-medium leading-relaxed">
              {language === "bn" 
                ? "আকুয়ালিংক বিডি-তে পোনা কেনা-বেচা, পুকুর ভাড়া এবং মৎস্য বিশেষজ্ঞদের পরামর্শ পাবেন এখন এক ঠিকানায়। আধুনিক প্রযুক্তিতে আপনার মৎস্য সম্পদকে করুন আরও লাভজনক।" 
                : "The ultimate ecosystem for fish fry trade, pond rentals, and professional consultations. Modernize your fishery business with AquaLink BD's expert technology."}
            </p>

            <div className="flex flex-wrap items-center gap-5 pt-2">
              <LinkNext 
                href="/products" 
                className="px-8 py-4 bg-[var(--primary)] text-[var(--surface)] rounded-xl font-bold flex items-center gap-3 hover:opacity-90 transition-all shadow-lg"
              >
                {language === "bn" ? "এখনই শুরু করুন" : "Get Started Now"}
                <ArrowRight size={20} />
              </LinkNext>
            </div>

            {/* Quick Trust Badges - Border and spacing using variables */}
            <div className="flex flex-wrap gap-x-10 gap-y-4 pt-8 border-t border-[var(--border)]">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--glass)] border border-[var(--border)]">
                    {feature.icon}
                  </div>
                  <span className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-[var(--text)] opacity-80">
                    {language === "bn" ? feature.bn : feature.en}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Visual Stats Cards - Using .glass-effect class */}
          <div className="w-full lg:w-[30%] flex flex-col gap-6 items-center lg:items-end">
             <div className="glass-effect p-6 rounded-2xl w-full max-w-[320px] group transition-all duration-500">
                <div className="flex items-center gap-4 mb-3">
                   <div className="p-3 bg-[var(--primary)] rounded-2xl group-hover:scale-110 transition-transform">
                      <Users className="text-[var(--surface)]" size={24} />
                   </div>
                   <div>
                      <p className="text-[var(--text)] opacity-60 text-xs uppercase font-bold tracking-wider">Community</p>
                      <h3 className="text-[var(--text)] text-2xl font-bold">{language === 'bn' ? '১০,০০০+' : '10,000+'}</h3>
                   </div>
                </div>
                <p className="text-[var(--text)] opacity-70 text-sm leading-relaxed">
                  {language === 'bn' 
                    ? "সক্রিয় মৎস্য চাষি এবং ব্যবসায়ী আমাদের সাথে যুক্ত আছেন।" 
                    : "Active fish farmers and traders are connected with our platform."}
                </p>
             </div>

             <div className="glass-effect p-6 rounded-2xl w-full max-w-[320px] group transition-all duration-500">
                <div className="flex items-center gap-4 mb-3">
                   <div className="p-3 bg-[var(--accent)] rounded-2xl group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="text-[var(--surface)]" size={24} />
                   </div>
                   <div>
                      <p className="text-[var(--text)] opacity-60 text-xs uppercase font-bold tracking-wider">Success Rate</p>
                      <h3 className="text-[var(--text)] text-2xl font-bold">{language === 'bn' ? '৯৮%' : '98%'}</h3>
                   </div>
                </div>
                <p className="text-[var(--text)] opacity-70 text-sm leading-relaxed">
                  {language === 'bn' 
                    ? "সঠিক পরামর্শ এবং উন্নত পোনার মাধ্যমে সফল চাষ নিশ্চিত।" 
                    : "Ensuring successful farming through expert advice and quality seeds."}
                </p>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}