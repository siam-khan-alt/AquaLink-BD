"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  CircleDollarSign,
  Fish,
  Activity,
  Plus,
  X,
  Waves,
  Calendar,
  Info,
  AlertTriangle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { SkeletonStats, SkeletonCard } from "@/components/ui/SkeletonCard";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type {
  Pond,
  PondsResponse,
  DashboardStats,
  StatsResponse,
  ChartDataRow,
  Alert,
  AlertsResponse,
  ChartDataResponse,
} from "@/shared/types/api-interfaces";

const formatBDT = (val: number): string => {
  return (
    "৳ " +
    new Intl.NumberFormat("bn-BD", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val)
  );
};

const MONTHS_BN = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

export default function FarmerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    area: "",
    fishTypesInput: "",
    initialPh: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const queryResults = useQueries({
    queries: [
      {
        queryKey: ["ponds-stats"],
        queryFn: async () => {
          const res = await fetch("/api/ponds/stats");
          if (!res.ok) throw new Error("পরিসংখ্যান লোড করতে ব্যর্থ হয়েছে");
          return res.json() as Promise<StatsResponse>;
        },
        enabled: status === "authenticated",
      },
      {
        queryKey: ["ponds-list"],
        queryFn: async () => {
          const res = await fetch("/api/ponds");
          if (!res.ok) throw new Error("পুকুরের তথ্য লোড করতে ব্যর্থ হয়েছে");
          return res.json() as Promise<PondsResponse>;
        },
        enabled: status === "authenticated",
      },
      {
        queryKey: ["alerts"],
        queryFn: async () => {
          const res = await fetch("/api/home/alerts");
          if (!res.ok) throw new Error("সতর্কতা লোড করতে ব্যর্থ হয়েছে");
          return res.json() as Promise<AlertsResponse>;
        },
        enabled: status === "authenticated",
        refetchInterval: 60000, // Refetch every minute
      },
      {
        queryKey: ["chart-data"],
        queryFn: async () => {
          const res = await fetch("/api/ponds/chart-data");
          if (!res.ok) throw new Error("চার্ট ডেটা লোড করতে ব্যর্থ হয়েছে");
          return res.json() as Promise<ChartDataResponse>;
        },
        enabled: status === "authenticated",
      },
    ],
  });

  const statsData = queryResults[0].data;
  const pondsData = queryResults[1].data;
  const alertsData = queryResults[2].data;
  const chartDataResponse = queryResults[3].data;
  const isStatsLoading = queryResults[0].isLoading;
  const isPondsLoading = queryResults[1].isLoading;

  const addPondMutation = useMutation({
    mutationFn: async (newPondData: {
      name: string;
      area: number;
      fishType: string[];
      initialPh: number;
    }) => {
      const res = await fetch("/api/ponds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPondData),
      });
      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string };
        throw new Error(errorData.error || "পুকুর যোগ করতে ব্যর্থ হয়েছে");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("নতুন পুকুর সফলভাবে যোগ করা হয়েছে!");
      queryClient.invalidateQueries({ queryKey: ["ponds-stats"] });
      queryClient.invalidateQueries({ queryKey: ["ponds-list"] });
      setIsModalOpen(false);
      setFormData({ name: "", area: "", fishTypesInput: "", initialPh: "" });
      setFormErrors({});
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen p-6 bg-[var(--background)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SkeletonStats count={4} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <SkeletonCard className="lg:col-span-2 h-80" />
          <SkeletonCard className="h-80" />
        </div>
        <SkeletonCard className="h-96" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const chartData = chartDataResponse?.data || [];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "পুকুরের নাম অবশ্যই দিতে হবে";
    }
    const areaNum = parseFloat(formData.area);
    if (isNaN(areaNum) || areaNum <= 0) {
      errors.area = "সঠিক ইতিবাচক পুকুরের আয়তন শতাংশে লিখুন";
    }
    if (!formData.fishTypesInput.trim()) {
      errors.fishTypes = "কমপক্ষে একটি মাছের প্রজাতি লিখুন";
    }
    const phNum = parseFloat(formData.initialPh);
    if (isNaN(phNum) || phNum < 0 || phNum > 14) {
      errors.initialPh = "সঠিক pH মান ০ থেকে ১৪ এর মধ্যে দিন";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const fishTypes = formData.fishTypesInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    addPondMutation.mutate({
      name: formData.name.trim(),
      area: areaNum,
      fishType: fishTypes,
      initialPh: phNum,
    });
  };

  const stats: DashboardStats = statsData?.stats || {
    totalPonds: 0,
    totalActiveSpecies: 0,
    totalExpenses: 0,
    averagePH: 0,
  };

  // Filter alerts based on farmer's district
  const farmerDistrict = (session?.user as { district?: string })?.district;
  const filteredAlerts =
    alertsData?.alerts?.filter((alert) => {
      if (!farmerDistrict) return true; // Show all alerts if no district set
      return (
        alert.region === "সব" ||
        alert.region === farmerDistrict ||
        alert.region === "সকল"
      );
    }) || [];

  const getPHStatusLabel = (ph: number) => {
    if (ph === 0)
      return {
        label: "তথ্য নেই",
        color: "text-[var(--text)]/60 bg-[var(--border)]",
      };
    if (ph >= 6.5 && ph <= 8.5) {
      return {
        label: "স্বাভাবিক (উত্তম)",
        color: "text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20 border",
      };
    }
    return {
      label: "ঝুঁকিপূর্ণ",
      color: "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20 border",
    };
  };

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border)] pb-8">
          <div>
            <h1 className="text-3xl font-black text-[var(--text)] tracking-tight font-hind">
              চাষি ড্যাশবোর্ড
            </h1>
            <p className="text-[var(--text)]/60 text-sm font-medium mt-1 font-hind">
              আপনার খামারের মাছের বৃদ্ধি, পানির গুণমান এবং বিনিয়োগ ট্র্যাকিং
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="sm:w-auto h-12 flex items-center justify-center gap-2 font-hind text-sm font-bold shadow-lg hover:scale-105 transition-all"
          >
            <Plus size={18} />
            নতুন পুকুর যোগ করুন
          </Button>
        </div>

        {/* Row 1: Analytical Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Ponds */}
          <Card className="hover:scale-[1.02] transition-transform duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-[var(--text)]/60 font-hind">
                  মোট পুকুর সংখ্যা
                </p>
                <h3 className="text-4xl font-black text-[var(--text)] mt-2 font-hind tracking-tight">
                  {isStatsLoading ? (
                    <div className="w-20 h-8 bg-[var(--border)]/30 rounded animate-pulse" />
                  ) : (
                    <TriangleDataCounter value={stats.totalPonds} />
                  )}
                </h3>
              </div>
              <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl border border-[var(--primary)]/20">
                <Waves size={24} />
              </div>
            </div>
            <p className="text-xs text-[var(--text)]/40 mt-4 font-hind">
              নিবন্ধিত সচল খামার ইউনিট
            </p>
          </Card>

          {/* Card 2: Total Expenses */}
          <Card className="hover:scale-[1.02] transition-transform duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-[var(--text)]/60 font-hind">
                  মোট বিনিয়োগ
                </p>
                <h3 className="text-3xl font-black text-[var(--text)] mt-3 font-hind tracking-tight">
                  {isStatsLoading ? (
                    <div className="w-20 h-8 bg-[var(--border)]/30 rounded animate-pulse" />
                  ) : (
                    formatBDT(stats.totalExpenses)
                  )}
                </h3>
              </div>
              <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl border border-[var(--primary)]/20">
                <CircleDollarSign size={24} />
              </div>
            </div>
            <p className="text-xs text-[var(--text)]/40 mt-4 font-hind">
              খাদ্য ও সার ক্রয় বাবদ ব্যয়
            </p>
          </Card>

          {/* Card 3: Active Species */}
          <Card className="hover:scale-[1.02] transition-transform duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-[var(--text)]/60 font-hind">
                  সক্রিয় মাছের প্রজাতি
                </p>
                <h3 className="text-4xl font-black text-[var(--text)] mt-2 font-hind tracking-tight">
                  {isStatsLoading ? (
                    <div className="w-20 h-8 bg-[var(--border)]/30 rounded animate-pulse" />
                  ) : (
                    new Intl.NumberFormat("bn-BD").format(
                      stats.totalActiveSpecies
                    )
                  )}
                </h3>
              </div>
              <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl border border-[var(--primary)]/20">
                <Fish size={24} />
              </div>
            </div>
            <p className="text-xs text-[var(--text)]/40 mt-4 font-hind">
              পুকুরে চাষ করা মাছের প্রকার
            </p>
          </Card>

          {/* Card 4: Avg pH */}
          <Card className="hover:scale-[1.02] transition-transform duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-[var(--text)]/60 font-hind">
                  গড় পানির pH মান
                </p>
                <h3 className="text-4xl font-black text-[var(--text)] mt-2 font-hind tracking-tight">
                  {isStatsLoading ? (
                    <div className="w-20 h-8 bg-[var(--border)]/30 rounded animate-pulse" />
                  ) : stats.averagePH > 0 ? (
                    new Intl.NumberFormat("bn-BD").format(stats.averagePH)
                  ) : (
                    "০.০"
                  )}
                </h3>
              </div>
              <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl border border-[var(--primary)]/20">
                <Activity size={24} />
              </div>
            </div>
            {stats.averagePH > 0 ? (
              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-hind ${
                    getPHStatusLabel(stats.averagePH).color
                  }`}
                >
                  {getPHStatusLabel(stats.averagePH).label}
                </span>
              </div>
            ) : (
              <p className="text-xs text-[var(--text)]/40 mt-4 font-hind">
                পরিমাপ লগ পাওয়া যায়নি
              </p>
            )}
          </Card>
        </div>

        {/* Row 2: Emergency Alerts */}
        {filteredAlerts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={24} className="text-[var(--primary)]" />
              <h2 className="text-xl font-extrabold text-[var(--text)] font-hind">
                জরুরি সতর্কতা
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAlerts.map((alert) => {
                const isDanger = alert.severity === "danger";
                const isWarning = alert.severity === "warning";

                return (
                  <Card
                    key={alert._id}
                    className={`p-4 border-2 transition-all duration-300 ${
                      isDanger
                        ? "border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse"
                        : isWarning
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-blue-500 bg-blue-500/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isDanger
                            ? "bg-red-500"
                            : isWarning
                            ? "bg-amber-500"
                            : "bg-blue-500"
                        }`}
                      >
                        {isDanger ? (
                          <XCircle size={20} className="text-white" />
                        ) : isWarning ? (
                          <AlertCircle size={20} className="text-white" />
                        ) : (
                          <Info size={20} className="text-white" />
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <h3 className="font-bold text-[var(--text)] font-hind text-sm">
                          {alert.title}
                        </h3>
                        <p className="text-xs text-[var(--text)]/70 font-hind">
                          {alert.region}
                        </p>
                        <p className="text-xs text-[var(--text)]/60 font-hind mt-2">
                          {alert.detail}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Row 3: Interactive Chart */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] pb-4 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text)] font-hind">
                বিনিয়োগ বিশ্লেষণ
              </h2>
              <p className="text-sm text-[var(--text)]/60 font-hind mt-1">
                বিগত ৬ মাসে খাদ্য ও সার বাবদ ব্যয়ের চিত্র
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-[var(--text)]/60 font-hind mt-2 sm:mt-0">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[var(--primary)] rounded-full"></span>
                খাদ্য
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#a855f7] rounded-full"></span>
                সার
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#e2e8f0] rounded-full"></span>
                অন্যান্য
              </div>
            </div>
          </div>

          <div className="h-80 w-full">
            {isPondsLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-full h-64 bg-[var(--border)]/20 rounded animate-pulse" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <Info size={40} className="mb-2 text-[var(--text)]" />
                <p className="font-semibold text-sm font-hind">
                  ব্যয়ের কোনো পরিসংখ্যান এখনও পাওয়া যায়নি।
                </p>
                <p className="text-xs font-hind mt-1">
                  পুকুরে ব্যয়ের তথ্য যোগ করা হলে চার্ট প্রদর্শিত হবে।
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorFeed" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--primary)"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorFertilizer"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="var(--text)"
                    fontSize={11}
                    opacity={0.6}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="var(--text)"
                    fontSize={11}
                    opacity={0.6}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface)",
                      borderColor: "var(--border)",
                      borderRadius: "12px",
                      color: "var(--text)",
                      fontFamily: "var(--font-hind)",
                      fontSize: "13px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="খাদ্য (Feed)"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorFeed)"
                  />
                  <Area
                    type="monotone"
                    dataKey="সার (Fertilizer)"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorFertilizer)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Row 3: Pond List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-[var(--text)] font-hind">
              নিবন্ধিত পুকুরসমূহ
            </h2>
            <span className="text-sm font-semibold text-[var(--text)]/60 font-hind">
              মোট:{" "}
              {isPondsLoading
                ? "..."
                : new Intl.NumberFormat("bn-BD").format(
                    pondsData?.ponds?.length || 0
                  )}
              টি পুকুর
            </span>
          </div>

          {isPondsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard count={3} className="h-64" />
            </div>
          ) : !pondsData?.ponds || pondsData.ponds.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-[var(--border)]">
              <Waves
                size={48}
                className="text-[var(--text)]/30 mb-4 animate-pulse"
              />
              <h3 className="text-lg font-bold text-[var(--text)] font-hind">
                কোনো পুকুর নিবন্ধিত নেই
              </h3>
              <p className="text-sm text-[var(--text)]/60 mt-1 max-w-md font-hind">
                মাছ চাষের সঠিক হিসেব এবংTelemetry ডেটা পর্যবেক্ষণ করতে আপনার
                প্রথম পুকুরটি আজই যুক্ত করুন।
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 font-hind text-sm font-bold flex items-center gap-2"
              >
                <Plus size={16} />
                নতুন পুকুর যুক্ত করুন
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pondsData.ponds.map((pond: Pond) => {
                const ph = pond.waterQuality?.pH || 0;
                const statusLabel = getPHStatusLabel(ph);

                return (
                  <Card
                    key={pond._id}
                    className="bg-[var(--surface)] hover:shadow-2xl hover:border-[var(--primary)]/30 transition-all duration-300 flex flex-col justify-between h-full"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">
                            <Waves size={20} />
                          </div>
                          <h3 className="font-extrabold text-lg text-[var(--text)] truncate font-hind">
                            {pond.name}
                          </h3>
                        </div>
                        <span className="text-xs font-bold px-2 py-1 bg-[var(--background)] border border-[var(--border)] rounded-lg font-hind text-[var(--text)]/75 whitespace-nowrap">
                          {new Intl.NumberFormat("bn-BD").format(pond.area)}{" "}
                          শতাংশ
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-[var(--text)]/50 font-semibold font-hind">
                          চাষকৃত মাছ
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {pond.fishType &&
                            pond.fishType.map(
                              (species: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-xs font-semibold px-2 py-0.5 bg-[var(--background)] text-[var(--primary)] rounded-md border border-[var(--border)] font-hind"
                                >
                                  {species}
                                </span>
                              )
                            )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[var(--border)]/50">
                        <div>
                          <p className="text-xs text-[var(--text)]/50 font-semibold font-hind">
                            পানির pH মান
                          </p>
                          <p className="text-base font-black text-[var(--text)] font-hind mt-0.5">
                            {new Intl.NumberFormat("bn-BD").format(ph)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text)]/50 font-semibold font-hind">
                            অক্সিজেন (DO)
                          </p>
                          <p className="text-base font-black text-[var(--text)] font-hind mt-0.5">
                            {new Intl.NumberFormat("bn-BD").format(
                              pond.waterQuality?.dissolvedO2 || 5.5
                            )}{" "}
                            মিলিগ্রাম/লি.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-2 pt-3 border-t border-[var(--border)]/30 text-xs text-[var(--text)]/40 font-semibold">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-hind ${statusLabel.color}`}
                      >
                        {statusLabel.label}
                      </span>
                      <span className="flex items-center gap-1 font-hind">
                        <Calendar size={12} />
                        {new Date(
                          pond.waterQuality?.lastTested || pond.createdAt
                        ).toLocaleDateString("bn-BD")}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic creation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <Card className="bg-[var(--surface)] w-full max-w-md border border-[var(--border)] relative shadow-2xl p-6 rounded-2xl flex flex-col justify-between animate-in slide-in-from-bottom-12 duration-400">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-5">
                <h3 className="text-xl font-bold text-[var(--text)] font-hind flex items-center gap-2">
                  <Waves className="text-[var(--primary)]" size={20} />
                  নতুন পুকুর যুক্ত করুন
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-[var(--border)] text-[var(--text)]/60 hover:text-[var(--text)] rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <Input
                  label="পুকুরের নাম"
                  id="pond-name"
                  placeholder="যেমন: উত্তর পাড়ের বড় পুকুর"
                  className="font-hind"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  error={formErrors.name}
                />

                <Input
                  label="আয়তন (শতাংশ)"
                  id="pond-area"
                  type="number"
                  step="0.01"
                  placeholder="যেমন: ১৫.৫"
                  className="font-hind"
                  value={formData.area}
                  onChange={(e) =>
                    setFormData({ ...formData, area: e.target.value })
                  }
                  error={formErrors.area}
                />

                <Input
                  label="মাছের প্রজাতি (কমা দিয়ে লিখুন)"
                  id="pond-fish"
                  placeholder="যেমন: রুই, কাতল, মৃগেল"
                  className="font-hind"
                  value={formData.fishTypesInput}
                  onChange={(e) =>
                    setFormData({ ...formData, fishTypesInput: e.target.value })
                  }
                  error={formErrors.fishTypes}
                />

                <Input
                  label="প্রাথমিক pH পরিমাপ"
                  id="pond-ph"
                  type="number"
                  step="0.1"
                  placeholder="যেমন: ৭.২"
                  className="font-hind"
                  value={formData.initialPh}
                  onChange={(e) =>
                    setFormData({ ...formData, initialPh: e.target.value })
                  }
                  error={formErrors.initialPh}
                />

                <div className="flex gap-3 pt-4 border-t border-[var(--border)] mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 font-hind text-sm h-11"
                  >
                    বাতিল
                  </Button>
                  <Button
                    type="submit"
                    isLoading={addPondMutation.isPending}
                    className="flex-1 font-hind text-sm h-11"
                  >
                    যুক্ত করুন
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function TriangleDataCounter({ value }: { value: number }) {
  return <>{new Intl.NumberFormat("bn-BD").format(value)}</>;
}
