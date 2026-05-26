"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Stethoscope, Search, MapPin, Phone, Mail, DollarSign, Filter } from "lucide-react";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Expert {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  specialization: string;
  consultationFee: number;
  bio: string;
  image?: string;
  district?: string;
  division?: string;
  availability?: {
    isAvailable: boolean;
  };
}

export default function FarmerExpertsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");

  const { data: expertsData, isLoading } = useQuery<{ experts: Expert[] }>({
    queryKey: ["experts", specializationFilter],
    queryFn: async () => {
      const url = `/api/experts${specializationFilter ? `?specialization=${encodeURIComponent(specializationFilter)}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("বিশেষজ্ঞ লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
  });

  const experts = expertsData?.experts || [];

  const filteredExperts = experts.filter((expert) =>
    expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expert.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const specializations = Array.from(new Set(experts.map((e) => e.specialization)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[var(--text)] font-hind">
          বিশেষজ্ঞ ডিরেক্টরি
        </h1>
        <p className="text-sm text-[var(--text)]/60 font-hind mt-1">
          যাচাইকৃত মৎস্য বিশেষজ্ঞদের সাথে পরামর্শ নিন
        </p>
      </div>

      {/* Search and Filter */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text)]/60" />
              <Input
                type="text"
                placeholder="নাম বা বিশেষীকরণ খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <div className="relative">
              <Filter size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text)]/60" />
              <select
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">সব বিশেষীকরণ</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Experts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
          <SkeletonCard count={3} className="h-64" />
        </div>
      ) : filteredExperts.length === 0 ? (
        <Card className="p-12 text-center">
          <Stethoscope size={48} className="text-[var(--text)]/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[var(--text)] font-hind">কোনো বিশেষজ্ঞ পাওয়া যায়নি</h3>
          <p className="text-sm text-[var(--text)]/60 mt-1 font-hind">
            আপনার অনুসন্ধানের সাথে মিলে এমন কোনো বিশেষজ্ঞ পাওয়া যায়নি
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperts.map((expert) => (
            <Card key={expert._id} className="p-6 hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Stethoscope size={32} className="text-[var(--primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-[var(--text)] font-hind truncate">
                    {expert.name}
                  </h3>
                  <p className="text-sm text-[var(--primary)] font-hind">{expert.specialization}</p>
                  {expert.availability?.isAvailable && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-green-500 mt-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      উপলব্ধ
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-[var(--text)]/80 font-hind line-clamp-2 mb-4">
                {expert.bio}
              </p>

              <div className="space-y-2 mb-4">
                {expert.phone && (
                  <div className="flex items-center gap-2 text-sm text-[var(--text)]/60 font-hind">
                    <Phone size={16} />
                    {expert.phone}
                  </div>
                )}
                {expert.email && (
                  <div className="flex items-center gap-2 text-sm text-[var(--text)]/60 font-hind">
                    <Mail size={16} />
                    {expert.email}
                  </div>
                )}
                {(expert.district || expert.division) && (
                  <div className="flex items-center gap-2 text-sm text-[var(--text)]/60 font-hind">
                    <MapPin size={16} />
                    {[expert.district, expert.division].filter(Boolean).join(", ")}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <DollarSign size={20} className="text-[var(--primary)]" />
                  <span className="text-lg font-bold text-[var(--text)] font-hind">
                    ৳ {expert.consultationFee}
                  </span>
                </div>
                <Button
                  size="sm"
                  className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-hind text-xs"
                >
                  পরামর্শ নিন
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
