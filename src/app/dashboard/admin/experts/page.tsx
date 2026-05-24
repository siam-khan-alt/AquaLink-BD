"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  UserCheck,
  Plus,
  X,
  Loader2,
  Mail,
  Phone,
  Award,
  Calendar,
  Edit,
  Trash2,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useExperts } from "@/shared/hooks/useExperts";

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function AdminExpertsManagement() {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    email: "",
    phone: "",
    specialization: "",
    avatarUrl: "",
    isVerified: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: expertsData, isLoading: isExpertsLoading } = useExperts({
    enabled: status === "authenticated",
  });

  const createExpertMutation = useMutation({
    mutationFn: async (newExpertData: {
      name: string;
      designation: string;
      email: string;
      phone: string;
      specialization: string;
      avatarUrl: string;
      isVerified: boolean;
    }) => {
      const res = await fetch("/api/admin/experts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpertData),
      });
      if (!res.ok) {
        const errorData = await res.json() as { error?: string };
        throw new Error(errorData.error || "বিশেষজ্ঞ তৈরি করতে ব্যর্থ হয়েছে");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("নতুন বিশেষজ্ঞ সফলভাবে তৈরি হয়েছে!");
      queryClient.invalidateQueries({ queryKey: ["experts"] });
      setIsModalOpen(false);
      setFormData({
        name: "",
        designation: "",
        email: "",
        phone: "",
        specialization: "",
        avatarUrl: "",
        isVerified: false,
      });
      setFormErrors({});
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const toggleVerificationMutation = useMutation({
    mutationFn: async ({ id, isVerified }: { id: string; isVerified: boolean }) => {
      const res = await fetch("/api/admin/experts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isVerified }),
      });
      if (!res.ok) {
        const errorData = await res.json() as { error?: string };
        throw new Error(errorData.error || "ভেরিফিকেশন আপডেট করতে ব্যর্থ হয়েছে");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("ভেরিফিকেশন স্ট্যাটাস আপডেট হয়েছে!");
      queryClient.invalidateQueries({ queryKey: ["experts"] });
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

    if (!formData.name.trim()) {
      errors.name = "নাম অবশ্যই দিতে হবে";
    }
    if (!formData.designation.trim()) {
      errors.designation = "পদবী অবশ্যই দিতে হবে";
    }
    if (formData.email && !formData.email.includes("@")) {
      errors.email = "সঠিক ইমেইল ঠিকানা দিন";
    }
    if (!formData.phone.trim()) {
      errors.phone = "ফোন নম্বর অবশ্যই দিতে হবে";
    }
    if (!formData.specialization.trim()) {
      errors.specialization = "বিশেষীকরণ অবশ্যই দিতে হবে";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    createExpertMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border)] pb-8">
          <div>
            <h1 className="text-3xl font-black text-[var(--text)] tracking-tight font-hind">
              বিশেষজ্ঞ ব্যবস্থাপনা
            </h1>
            <p className="text-[var(--text)]/60 text-sm font-medium mt-1 font-hind">
              মৎস্য বিশেষজ্ঞদের পরিচালনা এবং ভেরিফিকেশন
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="sm:w-auto h-12 flex items-center justify-center gap-2 font-hind text-sm font-bold shadow-lg hover:scale-105 transition-all"
          >
            <Plus size={18} />
            নতুন বিশেষজ্ঞ যোগ করুন
          </Button>
        </div>

        {/* Experts Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    নাম
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    পদবী
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    বিশেষীকরণ
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    যোগাযোগ
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    ভেরিফিকেশন
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
                {isExpertsLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : !expertsData?.experts || expertsData.experts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <UserCheck size={48} className="text-[var(--text)]/30 mx-auto mb-4" />
                      <p className="text-sm font-semibold text-[var(--text)]/60 font-hind">
                        কোনো বিশেষজ্ঞ পাওয়া যায়নি
                      </p>
                    </td>
                  </tr>
                ) : (
                  expertsData.experts.map((expert) => (
                    <tr
                      key={expert._id}
                      className="border-b border-[var(--border)]/50 hover:bg-[var(--surface)] transition-colors"
                    >
                      <td className="py-4 px-6 text-sm font-semibold text-[var(--text)] font-hind">
                        {expert.name}
                      </td>
                      <td className="py-4 px-6 text-sm text-[var(--text)]/80 font-hind">
                        {expert.designation}
                      </td>
                      <td className="py-4 px-6 text-sm text-[var(--text)]/80 font-hind flex items-center gap-1">
                        <Award size={14} />
                        {expert.specialization}
                      </td>
                      <td className="py-4 px-6 text-sm text-[var(--text)]/80 font-hind space-y-1">
                        {expert.email && (
                          <div className="flex items-center gap-1">
                            <Mail size={12} />
                            {expert.email}
                          </div>
                        )}
                        {expert.phone && (
                          <div className="flex items-center gap-1">
                            <Phone size={12} />
                            {expert.phone}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() =>
                            toggleVerificationMutation.mutate({
                              id: expert._id,
                              isVerified: !expert.isVerified,
                            })
                          }
                          disabled={toggleVerificationMutation.isPending}
                          className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full font-hind transition-colors ${
                            expert.isVerified
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          }`}
                        >
                          {expert.isVerified ? (
                            <>
                              <ShieldCheck size={12} />
                              ভেরিফাইড
                            </>
                          ) : (
                            <>
                              <ShieldX size={12} />
                              পেন্ডিং
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-sm text-[var(--text)]/60 font-hind flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(expert.createdAt)}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create Expert Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <Card className="bg-[var(--surface)] w-full max-w-md border border-[var(--border)] relative shadow-2xl p-6 rounded-2xl flex flex-col justify-between animate-in slide-in-from-bottom-12 duration-400 max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-5">
                <h3 className="text-xl font-bold text-[var(--text)] font-hind flex items-center gap-2">
                  <UserCheck className="text-[var(--primary)]" size={20} />
                  নতুন বিশেষজ্ঞ যোগ করুন
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
                  label="নাম"
                  id="name"
                  placeholder="যেমন: ড. মোহাম্মদ আব্দুল করিম"
                  className="font-hind"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={formErrors.name}
                />

                <Input
                  label="পদবী"
                  id="designation"
                  placeholder="যেমন: সিনিয়র উপজেলা মৎস্য কর্মকর্তা"
                  className="font-hind"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  error={formErrors.designation}
                />

                <Input
                  label="ইমেইল"
                  id="email"
                  type="email"
                  placeholder="expert@example.com"
                  className="font-hind"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={formErrors.email}
                />

                <Input
                  label="ফোন নম্বর"
                  id="phone"
                  placeholder="যেমন: +880 1712-345678"
                  className="font-hind"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  error={formErrors.phone}
                />

                <Input
                  label="বিশেষীকরণ"
                  id="specialization"
                  placeholder="যেমন: পুকুর ব্যবস্থাপনা"
                  className="font-hind"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  error={formErrors.specialization}
                />

                <Input
                  label="অ্যাভাতার URL"
                  id="avatarUrl"
                  placeholder="https://example.com/avatar.jpg"
                  className="font-hind"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                />

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is-verified"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                    className="w-4 h-4 accent-[var(--primary)]"
                  />
                  <label htmlFor="is-verified" className="text-sm font-semibold text-[var(--text)] font-hind">
                    ভেরিফাইড হিসেবে চিহ্নিত করুন
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
                    isLoading={createExpertMutation.isPending}
                    className="flex-1 font-hind text-sm h-11"
                  >
                    বিশেষজ্ঞ তৈরি করুন
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
