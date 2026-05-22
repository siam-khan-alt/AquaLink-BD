"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  Droplets,
  AlertTriangle,
  Plus,
  X,
  Loader2,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { toast } from "sonner";

interface IWaterQualityLog {
  _id: string;
  pondId: string;
  ph: number;
  dissolvedOxygen: number;
  ammonia: number;
  loggedAt: string;
  createdAt: string;
}

interface ILogsResponse {
  logs: IWaterQualityLog[];
}

interface IPond {
  _id: string;
  name: string;
  area: number;
  fishType: string[];
}

interface IPondResponse {
  pond: IPond;
}

const formatNumber = (val: number): string => {
  return new Intl.NumberFormat("bn-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "short",
  });
};

export default function PondAnalyticsPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const pondId = params.id as string;
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    ph: "",
    dissolvedOxygen: "",
    ammonia: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: pondData, isLoading: isPondLoading } = useQuery<IPondResponse>({
    queryKey: ["pond", pondId],
    queryFn: async () => {
      const res = await fetch(`/api/ponds/${pondId}`);
      if (!res.ok) throw new Error("পুকুরের তথ্য লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    enabled: status === "authenticated" && !!pondId,
  });

  const { data: logsData, isLoading: isLogsLoading } = useQuery<ILogsResponse>({
    queryKey: ["water-quality-logs", pondId],
    queryFn: async () => {
      const res = await fetch(`/api/water-quality?pondId=${pondId}&days=30`);
      if (!res.ok) throw new Error("পানির গুণমান লগ লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    enabled: status === "authenticated" && !!pondId,
    refetchInterval: 60000,
  });

  const addLogMutation = useMutation({
    mutationFn: async (logData: {
      pondId: string;
      ph: number;
      dissolvedOxygen: number;
      ammonia: number;
    }) => {
      const res = await fetch("/api/water-quality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logData),
      });
      if (!res.ok) {
        const errorData = await res.json() as { error?: string };
        throw new Error(errorData.error || "লগ যোগ করতে ব্যর্থ হয়েছে");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("পানির গুণমান লগ সফলভাবে যোগ করা হয়েছে!");
      queryClient.invalidateQueries({ queryKey: ["water-quality-logs", pondId] });
      setIsModalOpen(false);
      setFormData({ ph: "", dissolvedOxygen: "", ammonia: "" });
      setFormErrors({});
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (status === "loading" || isPondLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated" || !pondData?.pond) {
    router.push("/dashboard/farmer");
    return null;
  }

  const pond = pondData.pond;
  const logs = logsData?.logs || [];

  // Prepare chart data
  const chartData = logs.map((log) => ({
    date: formatDate(log.loggedAt),
    pH: log.ph,
    DO: log.dissolvedOxygen,
    Ammonia: log.ammonia,
  }));

  // Get latest log for warnings
  const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;

  const getWarnings = () => {
    if (!latestLog) return [];

    const warnings: { type: "danger" | "warning"; message: string; tip: string }[] = [];

    if (latestLog.ph < 6.5 || latestLog.ph > 8.5) {
      warnings.push({
        type: "danger",
        message: `pH মান স্বাভাবিক সীমার বাইরে (${formatNumber(latestLog.ph)})`,
        tip: "pH সমন্বয়ের জন্য চুন বা ট্যানিক এসিড ব্যবহার করুন",
      });
    }

    if (latestLog.ammonia > 0.05) {
      warnings.push({
        type: "danger",
        message: `অ্যামোনিয়া মাত্রা বেশি (${formatNumber(latestLog.ammonia)} ppm)`,
        tip: "অ্যামোনিয়া কমাতে আংশিক পানি পরিবর্তন করুন বা জিওলাইট ব্যবহার করুন",
      });
    }

    if (latestLog.dissolvedOxygen < 4) {
      warnings.push({
        type: "warning",
        message: `দ্রবীভূত অক্সিজেন কম (${formatNumber(latestLog.dissolvedOxygen)} mg/L)`,
        tip: "অক্সিজেন বাড়াতে এরেটর বা পানির স্প্রে ব্যবহার করুন",
      });
    }

    return warnings;
  };

  const warnings = getWarnings();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const phNum = parseFloat(formData.ph);
    if (isNaN(phNum) || phNum < 0 || phNum > 14) {
      errors.ph = "সঠিক pH মান ০ থেকে ১৪ এর মধ্যে দিন";
    }

    const doNum = parseFloat(formData.dissolvedOxygen);
    if (isNaN(doNum) || doNum < 0) {
      errors.dissolvedOxygen = "সঠিক অক্সিজেন মান দিন";
    }

    const ammoniaNum = parseFloat(formData.ammonia);
    if (isNaN(ammoniaNum) || ammoniaNum < 0) {
      errors.ammonia = "সঠিক অ্যামোনিয়া মান দিন";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    addLogMutation.mutate({
      pondId,
      ph: phNum,
      dissolvedOxygen: doNum,
      ammonia: ammoniaNum,
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="h-10 w-10 flex items-center justify-center p-0"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text)] font-hind">
              পুকুর বিশ্লেষণ: {pond.name}
            </h1>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              পানির গুণমান ট্র্যাকিং এবং টাইমলাইন বিশ্লেষণ
            </p>
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-3">
            {warnings.map((warning, index) => (
              <Card
                key={index}
                className={`p-4 border-2 ${
                  warning.type === "danger"
                    ? "border-red-500 bg-red-50"
                    : "border-amber-500 bg-amber-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      warning.type === "danger" ? "bg-red-500" : "bg-amber-500"
                    }`}
                  >
                    <AlertTriangle size={20} className="text-white" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-[var(--text)] font-hind text-sm">
                      {warning.message}
                    </p>
                    <p className="text-xs text-[var(--text)]/70 font-hind">
                      💡 {warning.tip}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Latest Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-sm text-[var(--text)]/60 font-hind">pH মান</p>
                <p className="text-2xl font-bold text-[var(--text)] font-hind">
                  {latestLog ? formatNumber(latestLog.ph) : "N/A"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-100 text-cyan-600 rounded-xl">
                <Droplets size={24} />
              </div>
              <div>
                <p className="text-sm text-[var(--text)]/60 font-hind">দ্রবীভূত অক্সিজেন</p>
                <p className="text-2xl font-bold text-[var(--text)] font-hind">
                  {latestLog ? formatNumber(latestLog.dissolvedOxygen) + " mg/L" : "N/A"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm text-[var(--text)]/60 font-hind">অ্যামোনিয়া</p>
                <p className="text-2xl font-bold text-[var(--text)] font-hind">
                  {latestLog ? formatNumber(latestLog.ammonia) + " ppm" : "N/A"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--text)] font-hind">
                পানির গুণমান টাইমলাইন
              </h2>
              <p className="text-sm text-[var(--text)]/60 font-hind">
                গত ৩০ দিনের তথ্য
              </p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 font-hind text-sm"
            >
              <Plus size={16} />
              নতুন লগ যোগ করুন
            </Button>
          </div>

          {isLogsLoading ? (
            <div className="h-96 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center text-center">
              <Activity size={48} className="text-[var(--text)]/30 mb-4" />
              <p className="text-sm text-[var(--text)]/60 font-hind">
                কোনো লগ পাওয়া যায়নি
              </p>
              <p className="text-xs text-[var(--text)]/40 font-hind mt-1">
                প্রথম লগ যোগ করতে &quot;নতুন লগ যোগ করুন&quot; বাটনে ক্লিক করুন
              </p>
            </div>
          ) : (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--text)" fontSize={12} />
                  <YAxis stroke="var(--text)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface)",
                      borderColor: "var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="pH"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6" }}
                    name="pH"
                  />
                  <Line
                    type="monotone"
                    dataKey="DO"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: "#06b6d4" }}
                    name="অক্সিজেন (mg/L)"
                  />
                  <Line
                    type="monotone"
                    dataKey="Ammonia"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={{ fill: "#a855f7" }}
                    name="অ্যামোনিয়া (ppm)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

      </div>

      {/* Add Log Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <Card className="bg-[var(--surface)] w-full max-w-md border border-[var(--border)] relative shadow-2xl p-6 rounded-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-5">
              <h3 className="text-xl font-bold text-[var(--text)] font-hind">
                পানির গুণমান লগ যোগ করুন
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
                label="pH মান"
                type="number"
                step="0.1"
                placeholder="যেমন: ৭.২"
                value={formData.ph}
                onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                error={formErrors.ph}
                className="font-hind"
              />

              <Input
                label="দ্রবীভূত অক্সিজেন (mg/L)"
                type="number"
                step="0.1"
                placeholder="যেমন: ৫.৫"
                value={formData.dissolvedOxygen}
                onChange={(e) => setFormData({ ...formData, dissolvedOxygen: e.target.value })}
                error={formErrors.dissolvedOxygen}
                className="font-hind"
              />

              <Input
                label="অ্যামোনিয়া (ppm)"
                type="number"
                step="0.01"
                placeholder="যেমন: ০.০২"
                value={formData.ammonia}
                onChange={(e) => setFormData({ ...formData, ammonia: e.target.value })}
                error={formErrors.ammonia}
                className="font-hind"
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
                  isLoading={addLogMutation.isPending}
                  className="flex-1 font-hind text-sm h-11"
                >
                  যোগ করুন
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
