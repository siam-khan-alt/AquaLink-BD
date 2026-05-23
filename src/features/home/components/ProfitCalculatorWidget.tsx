"use client";

import { useState, useMemo } from "react";
import { TrendingUp, Scale, DollarSign, Calculator, Download, Loader2 } from "lucide-react";
import { Card, Button } from "@heroui/react";
import { toast } from "sonner";

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

    return {
      totalFishWeight,
      totalRevenue,
      totalFeedNeeded,
      totalFeedCost,
      otherCosts,
      totalCost,
      netProfit,
      roi,
    };
  }, [pondSize, fishCount, feedCostPerKg, expectedGrowth, marketPricePerKg]);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      
      // Create a temporary container for PDF generation
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "210mm";
      container.style.padding = "20px";
      container.style.fontFamily = "'Noto Sans Bengali', sans-serif";
      container.style.background = "white";
      
      container.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; padding: 30px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 12px;">
          <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 8px;">মৎস্য বন্ধু</h1>
          <p style="font-size: 14px; opacity: 0.9;">লাভ-ক্ষতি ও বিনিয়োগ রিপোর্ট</p>
          <p style="font-size: 12px; margin-top: 8px;">${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: 700; color: #059669; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #10b981;">ইনপুট তথ্য</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background: #f9fafb; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">পুকুরের আকার</div>
              <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">${pondSize} শতাংশ</div>
            </div>
            <div style="background: #f9fafb; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">মাছের সংখ্যা</div>
              <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">${fishCount.toLocaleString('bn-BD')} টি</div>
            </div>
            <div style="background: #f9fafb; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">খাবারের দাম (প্রতি কেজি)</div>
              <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">${feedCostPerKg.toLocaleString('bn-BD')} টাকা</div>
            </div>
            <div style="background: #f9fafb; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">প্রত্যাশিত ওজন (প্রতি মাছ)</div>
              <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">${expectedGrowth.toLocaleString('bn-BD')} গ্রাম</div>
            </div>
            <div style="background: #f9fafb; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">বাজার দাম (প্রতি কেজি)</div>
              <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">${marketPricePerKg.toLocaleString('bn-BD')} টাকা</div>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: 700; color: #059669; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #10b981;">গণনা বিবরণ</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background: #f9fafb; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">মোট মাছের ওজন</div>
              <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">${calculations.totalFishWeight.toFixed(2)} কেজি</div>
            </div>
            <div style="background: #f9fafb; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">মোট খাবার প্রয়োজন</div>
              <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">${calculations.totalFeedNeeded.toFixed(2)} কেজি</div>
            </div>
            <div style="background: #f9fafb; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">মোট খাবার খরচ</div>
              <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">${calculations.totalFeedCost.toLocaleString('bn-BD')} টাকা</div>
            </div>
            <div style="background: #f9fafb; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">অন্যান্য খরচ</div>
              <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">${calculations.otherCosts.toLocaleString('bn-BD')} টাকা</div>
            </div>
          </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); padding: 20px; border-radius: 8px; margin-top: 25px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(16, 185, 129, 0.19);">
            <span style="font-size: 14px; font-weight: 600; color: #374151;">মোট আয়</span>
            <span style="font-size: 18px; font-weight: 700; color: #10b981;">${calculations.totalRevenue.toLocaleString('bn-BD')} টাকা</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(16, 185, 129, 0.19);">
            <span style="font-size: 14px; font-weight: 600; color: #374151;">মোট খরচ</span>
            <span style="font-size: 18px; font-weight: 700; color: #ef4444;">${calculations.totalCost.toLocaleString('bn-BD')} টাকা</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(16, 185, 129, 0.19);">
            <span style="font-size: 14px; font-weight: 600; color: #374151;">নিট লাভ/ক্ষতি</span>
            <span style="font-size: 18px; font-weight: 700; color: ${calculations.netProfit >= 0 ? '#10b981' : '#ef4444'};">${calculations.netProfit.toLocaleString('bn-BD')} টাকা</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
            <span style="font-size: 14px; font-weight: 600; color: #374151;">ROI (বিনিয়োগের হার)</span>
            <span style="font-size: 18px; font-weight: 700; color: ${calculations.roi >= 0 ? '#10b981' : '#ef4444'};">${calculations.roi.toFixed(1)}%</span>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; background: #f9fafb; margin-top: 25px; font-size: 12px; color: #6b7280;">
          <p>এই রিপোর্টটি মৎস্য বন্ধু প্ল্যাটফর্ম থেকে জেনারেট করা হয়েছে</p>
          <p>© ${new Date().getFullYear()} মৎস্য বন্ধু - সর্বস্বত্ব সংরক্ষিত</p>
        </div>
      `;
      
      document.body.appendChild(container);
      
      const options = {
        margin: 10,
        filename: 'Fish_Profit_Report.pdf',
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      
      await html2pdf().set(options).from(container).save();
      
      document.body.removeChild(container);
      
      toast.success("রিপোর্ট ডাউনলোড সফল হয়েছে!");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("রিপোর্ট ডাউনলোড ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.08] shadow-2xl rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[var(--primary)]/10 rounded-xl">
          <Calculator className="text-[var(--primary)]" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-[var(--text)]">লাভ ক্যালকুলেটর</h3>
          <p className="text-xs font-bold text-[var(--text)]/50">আপনার বিনিয়োগের হিসাব দেখুন</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-[var(--text)] mb-2">
            <Scale size={16} className="text-[var(--primary)]" />
            পুকুরের আকার (শতাংশ)
          </label>
          <input
            type="range"
            step={0.5}
            min={0.5}
            max={10}
            value={pondSize}
            onChange={(e) => setPondSize(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-300 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
          />
          <div className="text-right text-sm font-black text-[var(--primary)] mt-1">{pondSize} শতাংশ</div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-[var(--text)] mb-2">
            <Scale size={16} className="text-[var(--primary)]" />
            মাছের সংখ্যা
          </label>
          <input
            type="range"
            step={100}
            min={100}
            max={5000}
            value={fishCount}
            onChange={(e) => setFishCount(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-300 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
          />
          <div className="text-right text-sm font-black text-[var(--primary)] mt-1">{fishCount} টি</div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-[var(--text)] mb-2">
            <DollarSign size={16} className="text-[var(--primary)]" />
            খাবারের দাম (প্রতি কেজি)
          </label>
          <input
            type="range"
            step={5}
            min={50}
            max={150}
            value={feedCostPerKg}
            onChange={(e) => setFeedCostPerKg(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-300 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
          />
          <div className="text-right text-sm font-black text-[var(--primary)] mt-1">{feedCostPerKg} টাকা</div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-[var(--text)] mb-2">
            <TrendingUp size={16} className="text-[var(--primary)]" />
            প্রত্যাশিত ওজন (প্রতি মাছ গ্রাম)
          </label>
          <input
            type="range"
            step={50}
            min={200}
            max={1000}
            value={expectedGrowth}
            onChange={(e) => setExpectedGrowth(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-300 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
          />
          <div className="text-right text-sm font-black text-[var(--primary)] mt-1">{expectedGrowth} গ্রাম</div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-[var(--text)] mb-2">
            <DollarSign size={16} className="text-[var(--primary)]" />
            বাজার দাম (প্রতি কেজি)
          </label>
          <input
            type="range"
            step={10}
            min={200}
            max={600}
            value={marketPricePerKg}
            onChange={(e) => setMarketPricePerKg(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-300 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
          />
          <div className="text-right text-sm font-black text-[var(--primary)] mt-1">{marketPricePerKg} টাকা</div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-[var(--border)]/60 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-[var(--text)]/70">মোট আয়</span>
          <span className="text-lg font-black text-emerald-500">{calculations.totalRevenue.toLocaleString()} টাকা</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-[var(--text)]/70">মোট খরচ</span>
          <span className="text-lg font-black text-red-500">{calculations.totalCost.toLocaleString()} টাকা</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-[var(--border)]/60">
          <span className="text-sm font-bold text-[var(--text)]">নিট লাভ</span>
          <span className={`text-xl font-black ${calculations.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {calculations.netProfit.toLocaleString()} টাকা
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-[var(--text)]/70">ROI</span>
          <span className={`text-lg font-black ${calculations.roi >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {calculations.roi.toFixed(1)}%
          </span>
        </div>
      </div>

      <Button
        onClick={handleDownloadPDF}
        isDisabled={isDownloading}
        className="w-full mt-4 bg-[var(--primary)] text-[#020617] font-bold hover:scale-105 active:scale-95 transition-all"
      >
        {isDownloading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            রিপোর্ট তৈরি হচ্ছে...
          </>
        ) : (
          <>
            <Download size={20} />
            রিপোর্ট ডাউনলোড করুন (PDF)
          </>
        )}
      </Button>
    </Card>
  );
}
