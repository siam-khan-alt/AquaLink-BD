"use client";

import { memo, useCallback, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Shield, Award, CreditCard, User, Loader2 } from "lucide-react";
import { Button, ScrollShadow } from "@heroui/react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useExperts, Expert } from "@/shared/hooks/useExperts";
import Image from "next/image";

const ExpertConsultantPanel = memo(() => {
  const { data: session } = useSession();
  const { data: expertsData, isLoading } = useExperts();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const experts: Expert[] = expertsData?.experts ?? [];

  const handleConsultExpert = useCallback(
    async (expert: Expert) => {
      const currentSession = session;
      if (!currentSession) {
        toast.error("অনুগ্রহ করে পরামর্শ নেওয়ার জন্য লগইন করুন");
        await signIn();
        return;
      }

      setProcessingId(expert._id);

      try {
        const res = await fetch("/api/payment/consultation/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ doctorId: expert._id }),
        });

        interface PaymentResponse {
          gatewayUrl?: string;
          error?: string;
        }

        const data: PaymentResponse = await res.json();

        if (!res.ok)
          throw new Error(data.error ?? "পেমেন্ট ইনিশিয়েট ব্যর্থ হয়েছে");

        if (data.gatewayUrl) {
          window.location.assign(data.gatewayUrl);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "কিছু ভুল হয়েছে";
        toast.error(message);
        setProcessingId(null);
      }
    },
    [session]
  );

  if (isLoading)
    return (
      <div className="h-80 w-full animate-pulse bg-zinc-900/50 rounded-2xl" />
    );

  return (
    <section id="expert-panel" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-[var(--primary)]" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[var(--text)]">
            বিশেষজ্ঞ পরামর্শ প্যানেল
          </h2>
        </div>
      </div>

      <ScrollShadow orientation="horizontal" className="flex gap-6 pb-4">
        {experts.map((expert) => {
          const isButtonLoading = processingId === expert._id;

          return (
            <motion.div
              key={expert._id}
              whileHover={{ y: -5 }}
              className="flex-shrink-0 w-72 bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)]/50 shadow-xl"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--primary)]/30 bg-zinc-800 flex items-center justify-center relative group shadow-lg">
                  {expert.image ? (
                    <Image
                      src={expert.image}
                      alt={expert.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-[var(--text)] font-bold text-xl"
                    style={{ display: expert.image ? "none" : "flex" }}
                  >
                    {expert.name ? expert.name.replace("ডাঃ ", "").substring(0, 1) : <User size={32} />}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black flex items-center justify-center gap-2 text-[var(--text)]">
                    <Award size={16} className="text-[var(--primary)]" />
                    {expert.name}
                  </h3>
                  <p className="text-xs font-bold text-[var(--primary)] mt-1">
                    {expert.specialization}
                  </p>
                  <p className="text-sm font-black text-[var(--primary)] mt-2">
                    ফি: {expert.consultationFee ?? 0} ৳
                  </p>
                </div>

                {/* HeroUI Button */}
                <Button
                  fullWidth
                  className="bg-[var(--primary)] text-white font-black flex items-center justify-center gap-2"
                  isDisabled={isButtonLoading}
                  onClick={() => handleConsultExpert(expert)}
                >
                  {isButtonLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>প্রসেস হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} />
                      <span>পরামর্শ নিন</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </ScrollShadow>
    </section>
  );
});

ExpertConsultantPanel.displayName = "ExpertConsultantPanel";
export default ExpertConsultantPanel;