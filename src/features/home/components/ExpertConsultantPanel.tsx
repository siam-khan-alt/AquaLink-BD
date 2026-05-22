"use client";

import React from "react";
import { Mail, Phone, Shield, Award } from "lucide-react";
import Button from "@/components/ui/Button";

interface Expert {
  name: string;
  designation: string;
  email: string;
  phone: string;
  initials: string;
}

const experts: Expert[] = [
  {
    name: "ড. মোহাম্মদ আব্দুল করিম",
    designation: "সিনিয়র উপজেলা মৎস্য কর্মকর্তা",
    email: "karim.fish@example.com",
    phone: "+880 1712-345678",
    initials: "মাক",
  },
  {
    name: "ড. ফাতেমা জাহান",
    designation: "অ্যাকুয়াকালচার স্পেশালিস্ট",
    email: "fatema.aqua@example.com",
    phone: "+880 1812-345678",
    initials: "ফাজ",
  },
  {
    name: "ড. রহিম উদ্দিন",
    designation: "মৎস্য রোগ বিশেষজ্ঞ",
    email: "rahim.fish@example.com",
    phone: "+880 1912-345678",
    initials: "রউ",
  },
];

export default function ExpertConsultantPanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-[var(--primary)]" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[var(--text)] font-hind">
            বিশেষজ্ঞ পরামর্শ প্যানেল
          </h2>
          <p className="text-sm text-[var(--text)]/60 font-hind">
            অভিজ্ঞ মৎস্য কর্মকর্তাদের সাথে সরাসরি যোগাযোগ করুন
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {experts.map((expert, index) => (
          <div
            key={index}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 hover:shadow-xl hover:border-[var(--primary)]/30 transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 rounded-full flex items-center justify-center border-2 border-[var(--primary)]/20">
                <span className="text-2xl font-black text-[var(--primary)] font-hind">
                  {expert.initials}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Award size={16} className="text-[var(--primary)]" />
                  <h3 className="text-lg font-bold text-[var(--text)] font-hind">
                    {expert.name}
                  </h3>
                </div>
                <p className="text-sm text-[var(--text)]/70 font-hind">
                  {expert.designation}
                </p>
              </div>

              <div className="w-full space-y-2 pt-2">
                <Button
                  variant="outline"
                  className="w-full font-hind font-semibold text-sm"
                  onClick={() => window.location.href = `mailto:${expert.email}`}
                >
                  <Mail size={16} className="mr-2" />
                  ইমেইল পাঠান
                </Button>
                <Button
                  variant="secondary"
                  className="w-full font-hind font-semibold text-sm"
                  onClick={() => window.location.href = `tel:${expert.phone}`}
                >
                  <Phone size={16} className="mr-2" />
                  কল করুন
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
