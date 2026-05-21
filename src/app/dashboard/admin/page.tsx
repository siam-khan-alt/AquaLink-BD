"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  Users,
  Waves,
  MessageSquare,
  Bell,
  TrendingUp,
  ShieldCheck,
  Loader2,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const fishTypes = ["Ruhi", "Pangas", "Tilapia", "Katla", "Mrigel", "Koi", "Other"] as const;

const priceSchema = z.object({
  fishType: z.string().min(1, "মাছের নাম বাধ্যতামূলক"),
  wholesalePrice: z.number().min(0, "পাইকারি দর ০ এর চেয়ে বেশি হতে হবে"),
  retailPrice: z.number().min(0, "খুচরা দর ০ এর চেয়ে বেশি হতে হবে"),
});

interface IAdminStats {
  totalFarmers: number;
  totalPonds: number;
  activeChatChannels: number;
  verifiedFarmers: number;
  notificationDispatchStatus: string;
}

interface IStatsResponse {
  stats: IAdminStats;
}

interface IFarmer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
}

const formatNumber = (val: number): string => {
  return new Intl.NumberFormat("bn-BD").format(val);
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"farmers" | "prices">("farmers");

  const [priceFormData, setPriceFormData] = useState({
    fishType: "Ruhi",
    wholesalePrice: "",
    retailPrice: "",
  });
  const [priceFormErrors, setPriceFormErrors] = useState<Record<string, string>>({});

  const { data: statsData, isLoading: isStatsLoading } = useQuery<IStatsResponse>({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const res = await fetch("/api/admin/overview");
      if (!res.ok) throw new Error("পরিসংখ্যান লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const { data: farmersData, isLoading: isFarmersLoading } = useQuery<{ farmers: IFarmer[] }>({
    queryKey: ["admin-farmers"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("চাষি তালিকা লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    enabled: status === "authenticated" && activeTab === "farmers",
  });

  const updatePriceMutation = useMutation({
    mutationFn: async (priceData: {
      fishType: string;
      wholesalePrice: number;
      retailPrice: number;
    }) => {
      const res = await fetch("/api/admin/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(priceData),
      });
      if (!res.ok) {
        const errorData = await res.json() as { error?: string };
        throw new Error(errorData.error || "বাজার দর আপডেট করতে ব্যর্থ হয়েছে");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("বাজার দর সফলভাবে আপডেট করা হয়েছে!");
      setPriceFormData({
        fishType: "Ruhi",
        wholesalePrice: "",
        retailPrice: "",
      });
      setPriceFormErrors({});
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
      </div>
    );
  }

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const wholesaleNum = parseFloat(priceFormData.wholesalePrice);
    if (isNaN(wholesaleNum) || wholesaleNum < 0) {
      errors.wholesalePrice = "সঠিক পাইকারি দর লিখুন";
    }
    const retailNum = parseFloat(priceFormData.retailPrice);
    if (isNaN(retailNum) || retailNum < 0) {
      errors.retailPrice = "সঠিক খুচরা দর লিখুন";
    }

    if (Object.keys(errors).length > 0) {
      setPriceFormErrors(errors);
      return;
    }

    updatePriceMutation.mutate({
      fishType: priceFormData.fishType,
      wholesalePrice: wholesaleNum,
      retailPrice: retailNum,
    });
  };

  const stats = statsData?.stats || {
    totalFarmers: 0,
    totalPonds: 0,
    activeChatChannels: 0,
    verifiedFarmers: 0,
    notificationDispatchStatus: "active",
  };

  const getFishLabel = (type: string): string => {
    const labels: Record<string, string> = {
      "Ruhi": "রুই",
      "Pangas": "পাঙ্গাস",
      "Tilapia": "তেলাপিয়া",
      "Katla": "কাতল",
      "Mrigel": "মৃগেল",
      "Koi": "কৈ",
      "Other": "অন্যান্য",
    };
    return labels[type] || type;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[var(--text)] tracking-tight font-hind">
              অ্যাডমিন ড্যাশবোর্ড
            </h1>
            <p className="text-[var(--text)]/60 text-sm font-medium mt-1 font-hind">
              সিস্টেম ওভারভিউ এবং প্ল্যাটফর্ম ব্যবস্থাপনা
            </p>
          </div>
        </div>

        {/* Row 1: System Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Total Farmers */}
          <Card className="hover:scale-[1.02] transition-transform duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-[var(--text)]/60 font-hind">মোট চাষি</p>
                <h3 className="text-4xl font-black text-[var(--text)] mt-2 font-hind tracking-tight">
                  {isStatsLoading ? (
                    <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                  ) : (
                    formatNumber(stats.totalFarmers)
                  )}
                </h3>
              </div>
              <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl border border-[var(--primary)]/20">
                <Users size={24} />
              </div>
            </div>
            <p className="text-xs text-[var(--text)]/40 mt-4 font-hind">নিবন্ধিত চাষি সংখ্যা</p>
          </Card>

          {/* Card 2: Total Ponds */}
          <Card className="hover:scale-[1.02] transition-transform duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-[var(--text)]/60 font-hind">মোট পুকুর</p>
                <h3 className="text-4xl font-black text-[var(--text)] mt-2 font-hind tracking-tight">
                  {isStatsLoading ? (
                    <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                  ) : (
                    formatNumber(stats.totalPonds)
                  )}
                </h3>
              </div>
              <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl border border-[var(--primary)]/20">
                <Waves size={24} />
              </div>
            </div>
            <p className="text-xs text-[var(--text)]/40 mt-4 font-hind">প্ল্যাটফর্মে নিবন্ধিত পুকুর</p>
          </Card>

          {/* Card 3: Active Chat Channels */}
          <Card className="hover:scale-[1.02] transition-transform duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-[var(--text)]/60 font-hind">সক্রিয় চ্যাট</p>
                <h3 className="text-4xl font-black text-[var(--text)] mt-2 font-hind tracking-tight">
                  {isStatsLoading ? (
                    <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                  ) : (
                    formatNumber(stats.activeChatChannels)
                  )}
                </h3>
              </div>
              <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl border border-[var(--primary)]/20">
                <MessageSquare size={24} />
              </div>
            </div>
            <p className="text-xs text-[var(--text)]/40 mt-4 font-hind">সক্রিয় কমিউনিকেশন চ্যানেল</p>
          </Card>

          {/* Card 4: Verified Farmers */}
          <Card className="hover:scale-[1.02] transition-transform duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-[var(--text)]/60 font-hind">ভেরিফাইড চাষি</p>
                <h3 className="text-4xl font-black text-[var(--text)] mt-2 font-hind tracking-tight">
                  {isStatsLoading ? (
                    <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                  ) : (
                    formatNumber(stats.verifiedFarmers)
                  )}
                </h3>
              </div>
              <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl border border-[var(--primary)]/20">
                <ShieldCheck size={24} />
              </div>
            </div>
            <p className="text-xs text-[var(--text)]/40 mt-4 font-hind">যাচাইকৃত চাষি প্রোফাইল</p>
          </Card>

        </div>

        {/* Row 2: Tabbed Dashboard Hub */}
        <Card className="p-6">
          <div className="flex items-center gap-4 border-b border-[var(--border)] pb-4 mb-6">
            <button
              onClick={() => setActiveTab("farmers")}
              className={`px-4 py-2 rounded-lg font-semibold font-hind transition-all ${
                activeTab === "farmers"
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--text)] hover:bg-[var(--surface)]"
              }`}
            >
              চাষি মনিটর
            </button>
            <button
              onClick={() => setActiveTab("prices")}
              className={`px-4 py-2 rounded-lg font-semibold font-hind transition-all ${
                activeTab === "prices"
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--text)] hover:bg-[var(--surface)]"
              }`}
            >
              বাজার দর নিয়ন্ত্রণ
            </button>
          </div>

          {/* Tab A: Farmers Monitor */}
          {activeTab === "farmers" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-[var(--text)] font-hind flex items-center gap-2">
                  <Users size={24} className="text-[var(--primary)]" />
                  চাষি তালিকা
                </h2>
                <span className="text-sm font-semibold text-[var(--text)]/60 font-hind">
                  মোট: {isFarmersLoading ? "..." : formatNumber(farmersData?.farmers?.length || 0)}টি চাষি
                </span>
              </div>

              {isFarmersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
                </div>
              ) : !farmersData?.farmers || farmersData.farmers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users size={48} className="text-[var(--text)]/30 mb-4" />
                  <h3 className="text-lg font-bold text-[var(--text)] font-hind">কোনো চাষি পাওয়া যায়নি</h3>
                  <p className="text-sm text-[var(--text)]/60 mt-1 font-hind">
                    প্ল্যাটফর্মে এখনও কোনো চাষি নিবন্ধিত নেই
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/70 font-hind">
                          নাম
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/70 font-hind">
                          ইমেইল/ফোন
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/70 font-hind">
                          স্ট্যাটাস
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/70 font-hind">
                          যোগদানের তারিখ
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/70 font-hind">
                          অ্যাকশন
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {farmersData.farmers.map((farmer) => (
                        <tr key={farmer._id} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface)] transition-colors">
                          <td className="py-3 px-4 text-sm font-semibold text-[var(--text)] font-hind">
                            {farmer.name}
                          </td>
                          <td className="py-3 px-4 text-sm text-[var(--text)]/80 font-hind">
                            {farmer.email || farmer.phone || "-"}
                          </td>
                          <td className="py-3 px-4">
                            {farmer.isVerified ? (
                              <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-green-100 text-green-800 rounded-full font-hind">
                                <CheckCircle size={12} />
                                ভেরিফাইড
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full font-hind">
                                <XCircle size={12} />
                                পেন্ডিং
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-[var(--text)]/60 font-hind">
                            {formatDate(farmer.createdAt)}
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="font-hind text-xs"
                              onClick={() => toast.info("চাষি ভেরিফিকেশন ফিচার শীঘ্রই আসছে")}
                            >
                              {farmer.isVerified ? "ম্যানেজ" : "ভেরিফাই করুন"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab B: Market Rate Controller */}
          {activeTab === "prices" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <DollarSign size={24} className="text-[var(--primary)]" />
                <h2 className="text-xl font-extrabold text-[var(--text)] font-hind">
                  বাজার দর আপডেট
                </h2>
              </div>

              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                <form onSubmit={handlePriceSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text)] mb-2 font-hind">
                      মাছের ধরন
                    </label>
                    <select
                      value={priceFormData.fishType}
                      onChange={(e) => setPriceFormData({ ...priceFormData, fishType: e.target.value })}
                      className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] font-hind focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      {fishTypes.map((type) => (
                        <option key={type} value={type}>
                          {getFishLabel(type)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="পাইকারি দর (টাকা/কেজি)"
                    id="wholesale-price"
                    type="number"
                    step="0.01"
                    placeholder="যেমন: ২৫০"
                    className="font-hind"
                    value={priceFormData.wholesalePrice}
                    onChange={(e) => setPriceFormData({ ...priceFormData, wholesalePrice: e.target.value })}
                    error={priceFormErrors.wholesalePrice}
                  />

                  <Input
                    label="খুচরা দর (টাকা/কেজি)"
                    id="retail-price"
                    type="number"
                    step="0.01"
                    placeholder="যেমন: ৩০০"
                    className="font-hind"
                    value={priceFormData.retailPrice}
                    onChange={(e) => setPriceFormData({ ...priceFormData, retailPrice: e.target.value })}
                    error={priceFormErrors.retailPrice}
                  />

                  <div className="flex items-center gap-2 pt-4 border-t border-[var(--border)]">
                    <Calendar size={16} className="text-[var(--text)]/60" />
                    <p className="text-xs text-[var(--text)]/60 font-hind">
                      আপডেট করার পর সার্চ ইঞ্জিন এবং পাবলিক পেজগুলো স্বয়ংক্রিয়ভাবে রিফ্রেশ হবে (ISR)
                    </p>
                  </div>

                  <Button
                    type="submit"
                    isLoading={updatePriceMutation.isPending}
                    className="w-full font-hind text-sm h-12"
                  >
                    <TrendingUp size={18} className="mr-2" />
                    দর প্রকাশ করুন
                  </Button>
                </form>
              </div>

              <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Bell size={20} className="text-[var(--primary)] mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-[var(--text)] font-hind">
                      ISR রিভ্যালিডেশন সক্রিয়
                    </p>
                    <p className="text-xs text-[var(--text)]/60 mt-1 font-hind">
                      দর আপডেট করার সাথে সাথে পাবলিক মার্কেট প্রাইস পেজগুলো স্বয়ংক্রিয়ভাবে রিফ্রেশ হবে।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}
