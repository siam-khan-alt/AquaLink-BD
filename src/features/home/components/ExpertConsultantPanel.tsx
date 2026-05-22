"use client";

import React, { useState, useEffect } from "react";
import { Mail, Phone, Shield, Award } from "lucide-react";
import Button from "@/components/ui/Button";
import { ScrollShadow, Avatar } from "@heroui/react";

interface Expert {
  _id?: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  specialization: string;
  avatarUrl: string;
}

function getInitials(name: string): string {
  const words = name.split(" ");
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default function ExpertConsultantPanel() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchExperts() {
      try {
        const res = await fetch("/api/home/experts");
        if (res.ok) {
          const data = await res.json();
          setExperts(data.experts || []);
        }
      } catch (error) {
        console.error("Failed to fetch experts:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchExperts();
  }, []);

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

      {isLoading ? (
        <div className="flex gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-72 h-80 bg-[var(--surface)] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <ScrollShadow orientation="horizontal" className="flex overflow-x-auto snap-x scrollbar-none gap-6 pb-4">
          {experts.map((expert) => (
            <div
              key={expert._id || expert.email}
              className="flex-shrink-0 w-72 flex flex-col items-center text-center space-y-4 snap-start"
            >
              <Avatar
                className="w-32 h-32 bg-gradient-to-br from-[var(--primary)]/30 to-[var(--primary)]/10 border-4 border-[var(--primary)]/20 shadow-2xl text-3xl font-black text-[var(--primary)]"
              >
                {getInitials(expert.name)}
              </Avatar>

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
          ))}
        </ScrollShadow>
      )}
    </div>
  );
}
