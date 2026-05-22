"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  AlertTriangle,
  Plus,
  X,
  Loader2,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Bell,
  Info,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface IAlert {
  _id: string;
  region: string;
  title: string;
  detail: string;
  level: "info" | "warning" | "danger";
  isActive: boolean;
  createdAt: string;
}

interface IAlertsResponse {
  alerts: IAlert[];
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getLevelConfig = (level: string) => {
  switch (level) {
    case "info":
      return {
        icon: Info,
        color: "bg-blue-100 text-blue-800",
        label: "তথ্য",
      };
    case "warning":
      return {
        icon: AlertCircle,
        color: "bg-yellow-100 text-yellow-800",
        label: "সতর্কতা",
      };
    case "danger":
      return {
        icon: XCircle,
        color: "bg-red-100 text-red-800",
        label: "বিপদ",
      };
    default:
      return {
        icon: Info,
        color: "bg-gray-100 text-gray-800",
        label: "অজানা",
      };
  }
};

export default function AdminAlertsManagement() {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    region: "",
    title: "",
    detail: "",
    level: "warning" as "info" | "warning" | "danger",
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: alertsData, isLoading: isAlertsLoading } = useQuery<IAlertsResponse>({
    queryKey: ["admin-alerts"],
    queryFn: async () => {
      const res = await fetch("/api/admin/alerts");
      if (!res.ok) throw new Error("সতর্কতা লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const createAlertMutation = useMutation({
    mutationFn: async (newAlertData: {
      region: string;
      title: string;
      detail: string;
      level: "info" | "warning" | "danger";
      isActive: boolean;
    }) => {
      const res = await fetch("/api/admin/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAlertData),
      });
      if (!res.ok) {
        const errorData = await res.json() as { error?: string };
        throw new Error(errorData.error || "সতর্কতা তৈরি করতে ব্যর্থ হয়েছে");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("নতুন সতর্কতা সফলভাবে তৈরি হয়েছে!");
      queryClient.invalidateQueries({ queryKey: ["admin-alerts"] });
      setIsModalOpen(false);
      setFormData({
        region: "",
        title: "",
        detail: "",
        level: "warning",
        isActive: true,
      });
      setFormErrors({});
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const toggleActivationMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch("/api/admin/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive }),
      });
      if (!res.ok) {
        const errorData = await res.json() as { error?: string };
        throw new Error(errorData.error || "অ্যাক্টিভেশন আপডেট করতে ব্যর্থ হয়েছে");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("অ্যাক্টিভেশন স্ট্যাটাস আপডেট হয়েছে!");
      queryClient.invalidateQueries({ queryKey: ["admin-alerts"] });
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.region.trim()) {
      errors.region = "অঞ্চল অবশ্যই দিতে হবে";
    }
    if (!formData.title.trim()) {
      errors.title = "শিরোনাম অবশ্যই দিতে হবে";
    }
    if (formData.detail.trim().length < 10) {
      errors.detail = "বিস্তারিত তথ্য কমপক্ষে ১০ অক্ষর হতে হবে";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    createAlertMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border)] pb-8">
          <div>
            <h1 className="text-3xl font-black text-[var(--text)] tracking-tight font-hind">
              জরুরি রোগ সতর্কতা ব্যবস্থাপনা
            </h1>
            <p className="text-[var(--text)]/60 text-sm font-medium mt-1 font-hind">
              মাছের রোগ সম্পর্কিত সতর্কতা প্রকাশ এবং পরিচালনা
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="sm:w-auto h-12 flex items-center justify-center gap-2 font-hind text-sm font-bold shadow-lg hover:scale-105 transition-all"
          >
            <Plus size={18} />
            নতুন সতর্কতা প্রকাশ করুন
          </Button>
        </div>

        {/* Alerts Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    অঞ্চল
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    শিরোনাম
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    বিস্তারিত
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    মাত্রা
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    স্ট্যাটাস
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    তারিখ
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    অ্যাকশন
                  </th>
                </tr>
              </thead>
              <tbody>
                {isAlertsLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : !alertsData?.alerts || alertsData.alerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <Bell size={48} className="text-[var(--text)]/30 mx-auto mb-4" />
                      <p className="text-sm font-semibold text-[var(--text)]/60 font-hind">
                        কোনো সতর্কতা পাওয়া যায়নি
                      </p>
                    </td>
                  </tr>
                ) : (
                  alertsData.alerts.map((alert) => {
                    const levelConfig = getLevelConfig(alert.level);
                    const LevelIcon = levelConfig.icon;
                    return (
                      <tr
                        key={alert._id}
                        className="border-b border-[var(--border)]/50 hover:bg-[var(--surface)] transition-colors"
                      >
                        <td className="py-4 px-6 text-sm text-[var(--text)] font-hind flex items-center gap-1">
                          <MapPin size={14} />
                          {alert.region}
                        </td>
                        <td className="py-4 px-6 text-sm font-semibold text-[var(--text)] font-hind">
                          {alert.title}
                        </td>
                        <td className="py-4 px-6 text-sm text-[var(--text)]/80 font-hind max-w-xs truncate">
                          {alert.detail}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full font-hind ${levelConfig.color}`}
                          >
                            <LevelIcon size={12} />
                            {levelConfig.label}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() =>
                              toggleActivationMutation.mutate({
                                id: alert._id,
                                isActive: !alert.isActive,
                              })
                            }
                            disabled={toggleActivationMutation.isPending}
                            className={`text-xs font-bold px-2.5 py-1 rounded-full font-hind transition-colors ${
                              alert.isActive
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                          >
                            {alert.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                          </button>
                        </td>
                        <td className="py-4 px-6 text-sm text-[var(--text)]/60 font-hind flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(alert.createdAt)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="font-hind text-xs"
                              onClick={() => toast.info("সম্পাদনা ফিচার শীঘ্রই আসছে")}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="font-hind text-xs text-red-600 hover:text-red-700"
                              onClick={() => toast.info("মুছে ফেলা ফিচার শীঘ্রই আসছে")}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create Alert Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <Card className="bg-[var(--surface)] w-full max-w-md border border-[var(--border)] relative shadow-2xl p-6 rounded-2xl flex flex-col justify-between animate-in slide-in-from-bottom-12 duration-400 max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-5">
                <h3 className="text-xl font-bold text-[var(--text)] font-hind flex items-center gap-2">
                  <AlertTriangle className="text-[var(--primary)]" size={20} />
                  নতুন সতর্কতা প্রকাশ করুন
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
                  label="অঞ্চল/জেলা"
                  id="region"
                  placeholder="যেমন: ঢাকা বিভাগ"
                  className="font-hind"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  error={formErrors.region}
                />

                <Input
                  label="শিরোনাম"
                  id="title"
                  placeholder="যেমন: ত্বক ক্ষত রোগ নজরদারি"
                  className="font-hind"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  error={formErrors.title}
                />

                <div>
                  <label className="block text-sm font-semibold text-[var(--text)] mb-2 font-hind">
                    বিস্তারিত তথ্য
                  </label>
                  <textarea
                    id="detail"
                    placeholder="সতর্কতার বিস্তারিত বিবরণ লিখুন..."
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] font-hind focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-h-[100px]"
                    value={formData.detail}
                    onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                  />
                  {formErrors.detail && (
                    <p className="text-xs text-red-600 mt-1 font-hind">{formErrors.detail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--text)] mb-2 font-hind">
                    মাত্রা
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as "info" | "warning" | "danger" })}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] font-hind focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="info">তথ্য (Info)</option>
                    <option value="warning">সতর্কতা (Warning)</option>
                    <option value="danger">বিপদ (Danger)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is-active"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 accent-[var(--primary)]"
                  />
                  <label htmlFor="is-active" className="text-sm font-semibold text-[var(--text)] font-hind">
                    এখনই সক্রিয় করুন
                  </label>
                </div>

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
                    isLoading={createAlertMutation.isPending}
                    className="flex-1 font-hind text-sm h-11"
                  >
                    সতর্কতা প্রকাশ করুন
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
