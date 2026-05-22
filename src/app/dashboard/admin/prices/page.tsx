"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TrendingUp,
  RefreshCw,
  Save,
  Fish,
  DollarSign,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface IPrice {
  _id: string;
  fishType: string;
  wholesalePrice: number;
  retailPrice: number;
  updatedAt: string;
}

interface IPricesResponse {
  success: boolean;
  prices: IPrice[];
}

const fishSpecies = [
  "Rui",
  "Katla",
  "Pangas",
  "Tilapia",
  "Shol",
  "Mrigel",
  "Koi",
  "Other",
] as const;

type FishSpecies = typeof fishSpecies[number];

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminPricesPage() {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const [prices, setPrices] = useState<Record<string, { wholesale: string; retail: string }>>({});

  const { data: pricesData, isLoading: isPricesLoading } = useQuery<IPricesResponse>({
    queryKey: ["admin-prices"],
    queryFn: async () => {
      const res = await fetch("/api/admin/prices");
      if (!res.ok) throw new Error("বাজার দর লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  useEffect(() => {
    if (pricesData?.prices) {
      const initialPrices: Record<string, { wholesale: string; retail: string }> = {};
      pricesData.prices.forEach((price: IPrice) => {
        initialPrices[price.fishType] = {
          wholesale: price.wholesalePrice.toString(),
          retail: price.retailPrice.toString(),
        };
      });
      setPrices(initialPrices);
    }
  }, [pricesData]);

  const updatePriceMutation = useMutation({
    mutationFn: async (fishType: string) => {
      const priceData = prices[fishType];
      const res = await fetch("/api/admin/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fishType,
          wholesalePrice: parseFloat(priceData.wholesale),
          retailPrice: parseFloat(priceData.retail),
        }),
      });
      if (!res.ok) throw new Error("বাজার দর আপডেট করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-prices"] });
      toast.success("বাজার দর সফলভাবে আপডেট হয়েছে");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "বাজার দর আপডেট করতে ব্যর্থ হয়েছে");
    },
  });

  const updateAllPricesMutation = useMutation({
    mutationFn: async () => {
      const promises = Object.keys(prices).map((fishType) =>
        fetch("/api/admin/prices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fishType,
            wholesalePrice: parseFloat(prices[fishType].wholesale),
            retailPrice: parseFloat(prices[fishType].retail),
          }),
        })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-prices"] });
      toast.success("সকল বাজার দর সফলভাবে আপডেট হয়েছে");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "বাজার দর আপডেট করতে ব্যর্থ হয়েছে");
    },
  });

  const handlePriceChange = (fishType: string, field: "wholesale" | "retail", value: string) => {
    setPrices((prev) => ({
      ...prev,
      [fishType]: {
        ...prev[fishType],
        [field]: value,
      },
    }));
  };

  const handleUpdateSingle = (fishType: string) => {
    if (!prices[fishType]?.wholesale || !prices[fishType]?.retail) {
      toast.error("সকল মূল্য প্রদান করতে হবে");
      return;
    }
    updatePriceMutation.mutate(fishType);
  };

  const handleUpdateAll = () => {
    const hasInvalidPrices = Object.values(prices).some(
      (price) => !price.wholesale || !price.retail
    );
    if (hasInvalidPrices) {
      toast.error("সকল মূল্য প্রদান করতে হবে");
      return;
    }
    updateAllPricesMutation.mutate();
  };

  if (status === "loading" || isPricesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] font-hind">
            বাজার দর আপডেট
          </h1>
          <p className="text-[var(--text)]/60 mt-1 font-hind">
            লাইভ পণ্যের মূল্য পরিচালনা করুন এবং ISR সিঙ্ক ট্রিগার করুন
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-prices"] })}
            className="font-hind font-semibold"
          >
            <RefreshCw size={20} className="mr-2" />
            রিফ্রেশ
          </Button>
          <Button
            onClick={handleUpdateAll}
            disabled={updateAllPricesMutation.isPending}
            className="font-hind font-semibold"
          >
            <Save size={20} className="mr-2" />
            {updateAllPricesMutation.isPending ? "আপডেট হচ্ছে..." : "সকল আপডেট করুন"}
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-[var(--surface)] border border-[var(--border)] p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle size={24} className="text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text)] font-hind mb-2">
              ISR সিঙ্ক সক্রিয়
            </h3>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              বাজার দর আপডেট করার সাথে সাথে পাবলিক মার্কেট প্রাইস পেজগুলো অটোমেটিক রিভ্যালিডেট হবে।
              এটি সার্চ ইঞ্জিন অপ্টিমাইজেশন এবং ব্যবহারকারী অভিজ্ঞতা উন্নত করে।
            </p>
          </div>
        </div>
      </Card>

      {/* Price Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {fishSpecies.map((fishType) => {
          const currentPrice = prices[fishType] || { wholesale: "", retail: "" };
          const lastUpdated = pricesData?.prices?.find((p: IPrice) => p.fishType === fishType)?.updatedAt;

          return (
            <Card
              key={fishType}
              className="bg-[var(--surface)] border border-[var(--border)] hover:shadow-xl hover:border-[var(--primary)]/30 transition-all duration-300"
            >
              <div className="p-6 space-y-4">
                {/* Fish Type Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
                  <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center">
                    <Fish size={24} className="text-[var(--primary)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text)] font-hind">
                      {fishType}
                    </h3>
                    {lastUpdated && (
                      <div className="flex items-center gap-1 text-xs text-[var(--text)]/40 font-hind">
                        <Calendar size={12} />
                        {formatDate(lastUpdated)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)]/60 mb-1.5 font-hind">
                      পাইকারি দর (টাকা/কেজি)
                    </label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text)]/40" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={currentPrice.wholesale}
                        onChange={(e) => handlePriceChange(fishType, "wholesale", e.target.value)}
                        placeholder="পাইকারি দর"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)]/60 mb-1.5 font-hind">
                      খুচরা দর (টাকা/কেজি)
                    </label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text)]/40" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={currentPrice.retail}
                        onChange={(e) => handlePriceChange(fishType, "retail", e.target.value)}
                        placeholder="খুচরা দর"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Update Button */}
                <Button
                  onClick={() => handleUpdateSingle(fishType)}
                  disabled={updatePriceMutation.isPending}
                  className="w-full font-hind font-semibold"
                  variant="outline"
                >
                  <TrendingUp size={16} className="mr-2" />
                  আপডেট করুন
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Last Updated Info */}
      {pricesData?.prices && pricesData.prices.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-[var(--text)]/40 font-hind">
            সর্বশেষ আপডেট: {formatDate(pricesData.prices[0].updatedAt)}
          </p>
        </div>
      )}
    </div>
  );
}
