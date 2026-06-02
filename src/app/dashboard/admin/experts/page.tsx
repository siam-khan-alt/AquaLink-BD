"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  UserCheck,
  X,
  Mail,
  Phone,
  Award,
  Calendar,
  Eye,
  ShieldCheck,
  ShieldX,
  Check,
  X as XIcon,
} from "lucide-react";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

interface IDoctorApplication {
  _id: string;
  name: string;
  email: string;
  phone: string;
  degree: string;
  specialization: string;
  licenseNumber: string;
  experience: number;
  consultationFee: number;
  bio: string;
  avatarUrl: string;
  certificateUrl: string;
  district?: string;
  division?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function AdminExpertsManagement() {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState<IDoctorApplication | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const { data: applicationsData, isLoading: isLoading } = useQuery<{ applications: IDoctorApplication[] }>({
    queryKey: ["admin-experts-applications"],
    queryFn: async () => {
      const res = await fetch("/api/admin/experts");
      if (!res.ok) throw new Error("আবেদন লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const approveApplicationMutation = useMutation({
    mutationFn: async ({ id, action, rejectionReason }: { id: string; action: "approve" | "reject"; rejectionReason?: string }) => {
      const res = await fetch("/api/admin/experts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, rejectionReason }),
      });
      if (!res.ok) {
        const errorData = await res.json() as { error?: string };
        throw new Error(errorData.error || "আবেদন প্রক্রিয়া করতে ব্যর্থ হয়েছে");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("আবেদন সফলভাবে প্রক্রিয়া করা হয়েছে!");
      queryClient.invalidateQueries({ queryKey: ["admin-experts-applications"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen p-6 bg-[var(--background)]">
        <SkeletonCard className="h-96" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border)] pb-8">
          <div>
            <h1 className="text-3xl font-black text-[var(--text)] tracking-tight font-hind">
              ডাক্তার আবেদন ব্যবস্থাপনা
            </h1>
            <p className="text-[var(--text)]/60 text-sm font-medium mt-1 font-hind">
              ডাক্তার আবেদন পর্যালোচনা এবং অনুমোদন
            </p>
          </div>
        </div>

        {/* Applications Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    নাম
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    ডিগ্রি
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    বিশেষীকরণ
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    যোগাযোগ
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
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12">
                      <SkeletonTable rows={5} columns={7} showHeader={false} />
                    </td>
                  </tr>
                ) : !applicationsData?.applications || applicationsData.applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <UserCheck size={48} className="text-[var(--text)]/30 mx-auto mb-4" />
                      <p className="text-sm font-semibold text-[var(--text)]/60 font-hind">
                        কোনো আবেদন পাওয়া যায়নি
                      </p>
                    </td>
                  </tr>
                ) : (
                  applicationsData.applications.map((application) => (
                    <tr
                      key={application._id}
                      className="border-b border-[var(--border)]/50 hover:bg-[var(--surface)] transition-colors"
                    >
                      <td className="py-4 px-6 text-sm font-semibold text-[var(--text)] font-hind">
                        {application.name}
                      </td>
                      <td className="py-4 px-6 text-sm text-[var(--text)]/80 font-hind">
                        {application.degree}
                      </td>
                      <td className="py-4 px-6 text-sm text-[var(--text)]/80 font-hind flex items-center gap-1">
                        <Award size={14} />
                        {application.specialization}
                      </td>
                      <td className="py-4 px-6 text-sm text-[var(--text)]/80 font-hind space-y-1">
                        <div className="flex items-center gap-1">
                          <Mail size={12} />
                          {application.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone size={12} />
                          {application.phone}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full font-hind ${
                          application.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : application.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {application.status === "approved" && <ShieldCheck size={12} />}
                          {application.status === "rejected" && <ShieldX size={12} />}
                          {application.status === "pending" && <ShieldX size={12} />}
                          {application.status === "approved" ? "অনুমোদিত" : application.status === "rejected" ? "বাতিল" : "পেন্ডিং"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-[var(--text)]/60 font-hind flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(application.createdAt)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-hind text-xs"
                            onClick={() => {
                              setSelectedApplication(application);
                              setIsDetailsModalOpen(true);
                            }}
                          >
                            <Eye size={14} />
                          </Button>
                          {application.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white font-hind text-xs"
                                onClick={() => approveApplicationMutation.mutate({ id: application._id, action: "approve" })}
                                disabled={approveApplicationMutation.isPending}
                              >
                                <Check size={14} />
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-500 hover:bg-red-600 text-white font-hind text-xs"
                                onClick={() => {
                                  const reason = prompt("বাতিলের কারণ লিখুন:");
                                  if (reason) {
                                    approveApplicationMutation.mutate({ id: application._id, action: "reject", rejectionReason: reason });
                                  }
                                }}
                                disabled={approveApplicationMutation.isPending}
                              >
                                <XIcon size={14} />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Details Modal */}
        {isDetailsModalOpen && selectedApplication && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <Card className="bg-[var(--surface)] w-full max-w-2xl border border-[var(--border)] relative shadow-2xl p-6 rounded-2xl flex flex-col max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-5">
                <h3 className="text-xl font-bold text-[var(--text)] font-hind flex items-center gap-2">
                  <UserCheck className="text-[var(--primary)]" size={20} />
                  আবেদনকারীর বিস্তারিত
                </h3>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="p-1.5 hover:bg-[var(--border)] text-[var(--text)]/60 hover:text-[var(--text)] rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--border)]">
                    <Image
                      src={selectedApplication.avatarUrl}
                      alt={selectedApplication.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-[var(--text)] font-hind">{selectedApplication.name}</h4>
                    <p className="text-sm text-[var(--text)]/60 font-hind mt-1">{selectedApplication.degree}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-[var(--text)]/80 font-hind">
                      <span className="flex items-center gap-1">
                        <Mail size={14} />
                        {selectedApplication.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={14} />
                        {selectedApplication.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[var(--text)]/60 font-hind mb-1">বিশেষীকরণ</p>
                    <p className="text-sm font-bold text-[var(--text)] font-hind">{selectedApplication.specialization}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text)]/60 font-hind mb-1">অভিজ্ঞতা</p>
                    <p className="text-sm font-bold text-[var(--text)] font-hind">{selectedApplication.experience} বছর</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text)]/60 font-hind mb-1">কনসালটেশন ফি</p>
                    <p className="text-sm font-bold text-[var(--text)] font-hind">৳ {selectedApplication.consultationFee}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text)]/60 font-hind mb-1">লাইসেন্স নম্বর</p>
                    <p className="text-sm font-bold text-[var(--text)] font-hind">{selectedApplication.licenseNumber}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-[var(--text)]/60 font-hind mb-1">বায়োগ্রাফি</p>
                  <p className="text-sm text-[var(--text)]/80 font-hind">{selectedApplication.bio}</p>
                </div>

                <div>
                  <p className="text-xs text-[var(--text)]/60 font-hind mb-2">সার্টিফিকেট</p>
                  <div className="border border-[var(--border)] rounded-lg overflow-hidden">
                    <Image
                      src={selectedApplication.certificateUrl}
                      alt="Certificate"
                      width={400}
                      height={300}
                      className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(selectedApplication.certificateUrl, '_blank')}
                    />
                  </div>
                </div>

                {selectedApplication.district && selectedApplication.division && (
                  <div className="flex items-center gap-4 text-sm text-[var(--text)]/60 font-hind">
                    <span>জেলা: {selectedApplication.district}</span>
                    <span>•</span>
                    <span>বিভাগ: {selectedApplication.division}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
