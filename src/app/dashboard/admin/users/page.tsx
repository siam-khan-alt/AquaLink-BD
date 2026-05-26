"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_CONFIG } from "@/shared/lib/constants";
import {
  Users,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { User, UsersResponse } from "@/shared/types/api-interfaces";
import { userRoleChangeSchema, userVerificationSchema } from "@/shared/lib/validation-schemas";
import { AdminTableSkeleton } from "@/shared/components/AdminSkeleton";
import { AdminErrorBoundary } from "@/shared/components/AdminErrorBoundary";

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function AdminUsersPage() {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: usersData, isLoading: isUsersLoading } = useQuery<UsersResponse>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("ব্যবহারকারীদের তথ্য লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    enabled: status === "authenticated",
    staleTime: QUERY_CONFIG.DEFAULT_STALE_TIME,
  });

  const toggleRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("ভূমিকা পরিবর্তন করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("ভূমিকা সফলভাবে পরিবর্তন হয়েছে");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "ভূমিকা পরিবর্তন করতে ব্যর্থ হয়েছে");
    },
  });

  const toggleVerificationMutation = useMutation({
    mutationFn: async ({ userId, isVerified }: { userId: string; isVerified: boolean }) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified }),
      });
      if (!res.ok) throw new Error("যাচাইকরণ পরিবর্তন করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("যাচাইকরণ সফলভাবে পরিবর্তন হয়েছে");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "যাচাইকরণ পরিবর্তন করতে ব্যর্থ হয়েছে");
    },
  });

  const filteredUsers = usersData?.farmers?.filter((user: User) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery)
  ) || [];

  if (status === "loading" || isUsersLoading) {
    return <AdminTableSkeleton rows={5} columns={6} />;
  }

  return (
    <AdminErrorBoundary>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] font-hind">
            চাষি তালিকা
          </h1>
          <p className="text-[var(--text)]/60 mt-1 font-hind">
            সকল নিবন্ধিত চাষিদের তথ্য পরিচালনা করুন
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text)]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম, ইমেইল বা ফোন দিয়ে খুঁজুন"
              className="pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--text)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent font-hind w-64"
            />
          </div>
          <Button variant="secondary" className="font-hind font-semibold">
            <Filter size={20} className="mr-2" />
            ফিল্টার
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[var(--surface)] border border-[var(--border)] p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text)]/60 font-hind">মোট চাষি</p>
              <p className="text-2xl font-bold text-[var(--text)] font-hind">
                {usersData?.farmers?.length || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-[var(--surface)] border border-[var(--border)] p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} className="text-green-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text)]/60 font-hind">যাচাইকৃত</p>
              <p className="text-2xl font-bold text-[var(--text)] font-hind">
                {usersData?.farmers?.filter((u: User) => u.isVerified).length || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-[var(--surface)] border border-[var(--border)] p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
              <XCircle size={24} className="text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text)]/60 font-hind">অযাচাইকৃত</p>
              <p className="text-2xl font-bold text-[var(--text)] font-hind">
                {usersData?.farmers?.filter((u: User) => !u.isVerified).length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text)] font-hind">
                  ব্যবহারকারী
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text)] font-hind">
                  যোগাযোগ
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text)] font-hind">
                  ভূমিকা
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text)] font-hind">
                  যাচাইকরণ
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text)] font-hind">
                  নিবন্ধন তারিখ
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text)] font-hind">
                  পদক্ষেপ
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user: User) => (
                  <tr key={user._id} className="border-b border-[var(--border)] hover:bg-[var(--border)]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
                          <Users size={20} className="text-[var(--primary)]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--text)] font-hind">
                            {user.name}
                          </p>
                          <p className="text-xs text-[var(--text)]/60 font-hind">
                            ID: {user._id.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-[var(--text)] font-hind">
                          <Mail size={14} className="text-[var(--text)]/40" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--text)] font-hind">
                          <Phone size={14} className="text-[var(--text)]/40" />
                          {user.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          const newRole = user.role === "admin" ? "farmer" : "admin";
                          toggleRoleMutation.mutate({ userId: user._id, newRole });
                        }}
                        disabled={toggleRoleMutation.isPending}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold font-hind transition-colors disabled:opacity-50"
                      >
                        <ShieldCheck size={16} />
                        {user.role === "admin" ? (
                          <span className="text-[var(--primary)]">অ্যাডমিন</span>
                        ) : (
                          <span className="text-[var(--text)]">চাষি</span>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          toggleVerificationMutation.mutate({
                            userId: user._id,
                            isVerified: !user.isVerified,
                          });
                        }}
                        disabled={toggleVerificationMutation.isPending}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold font-hind transition-colors disabled:opacity-50"
                      >
                        {user.isVerified ? (
                          <>
                            <CheckCircle size={16} className="text-green-500" />
                            <span className="text-green-500">যাচাইকৃত</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={16} className="text-yellow-500" />
                            <span className="text-yellow-500">অযাচাইকৃত</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--text)] font-hind">
                        <Calendar size={14} className="text-[var(--text)]/40" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="font-hind font-semibold">
                          বিস্তারিত
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
                        <Users size={32} className="text-[var(--primary)]" />
                      </div>
                      <p className="text-sm text-[var(--text)]/60 font-hind">
                        কোনো ব্যবহারকারী পাওয়া যায়নি
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
    </AdminErrorBoundary>
  );
}
