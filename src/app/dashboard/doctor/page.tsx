"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Stethoscope, Clock, DollarSign, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";

export default function DoctorDashboard() {
  const { data: session, status } = useSession();

  const { data: earningsData, isLoading: isEarningsLoading } = useQuery({
    queryKey: ["doctor-earnings"],
    queryFn: async () => {
      const res = await fetch("/api/doctor/earnings");
      if (!res.ok) throw new Error("উপার্জন লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const formatNumber = (val: number): string => {
    return new Intl.NumberFormat("bn-BD").format(val);
  };

  const earnings = earningsData || {
    totalEarnings: 0,
    totalConsultations: 0,
    monthlyEarnings: 0,
  };

  const stats = [
    {
      label: "মোট কনসালটেশন",
      value: isEarningsLoading ? "..." : formatNumber(earnings.totalConsultations),
      icon: <Stethoscope size={24} className="text-[var(--primary)]" />,
      trend: "+১২%",
    },
    {
      label: "পেন্ডিং রিকোয়েস্ট",
      value: "৮",
      icon: <Clock size={24} className="text-orange-500" />,
      trend: "+৩",
    },
    {
      label: "মাসিক আয়",
      value: isEarningsLoading ? "..." : `৳ ${formatNumber(earnings.monthlyEarnings)}`,
      icon: <DollarSign size={24} className="text-green-500" />,
      trend: "+২৫%",
    },
    {
      label: "মোট আয়",
      value: isEarningsLoading ? "..." : `৳ ${formatNumber(earnings.totalEarnings)}`,
      icon: <TrendingUp size={24} className="text-blue-500" />,
      trend: "+৪০%",
    },
  ];

  const recentConsultations = [
    {
      id: "1",
      farmerName: "রহিম উদ্দিন",
      pondName: "পুকুর-১",
      issue: "মাছের ক্ষত",
      status: "pending",
      date: "২০২৬-০৫-২৪",
    },
    {
      id: "2",
      farmerName: "করিম শেখ",
      pondName: "পুকুর-২",
      issue: "পানির গুণমান",
      status: "approved",
      date: "২০২৬-০৫-২৩",
    },
    {
      id: "3",
      farmerName: "আব্দুল হাকিম",
      pondName: "পুকুর-৩",
      issue: "খাবার সমস্যা",
      status: "completed",
      date: "২০২৬-০৫-২২",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[var(--text)] font-hind">
          ড্যাশবোর্ড ওভারভিউ
        </h1>
        <p className="text-sm text-[var(--text)]/60 font-hind mt-1">
          স্বাগতম, {session?.user?.name || "ডাক্তার"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-[var(--primary)]/10 rounded-xl">
                {stat.icon}
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm font-bold">
                <TrendingUp size={16} />
                {stat.trend}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black text-[var(--text)]">{stat.value}</p>
              <p className="text-sm text-[var(--text)]/60 font-hind">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Consultations */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-[var(--text)] font-hind">
            সাম্প্রতিক কনসালটেশন
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/60 font-hind">
                  চাষি
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/60 font-hind">
                  পুকুর
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/60 font-hind">
                  সমস্যা
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/60 font-hind">
                  স্ট্যাটাস
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/60 font-hind">
                  তারিখ
                </th>
              </tr>
            </thead>
            <tbody>
              {recentConsultations.map((consultation) => (
                <tr key={consultation.id} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface)]">
                  <td className="py-3 px-4 text-sm font-bold text-[var(--text)] font-hind">
                    {consultation.farmerName}
                  </td>
                  <td className="py-3 px-4 text-sm text-[var(--text)]/80 font-hind">
                    {consultation.pondName}
                  </td>
                  <td className="py-3 px-4 text-sm text-[var(--text)]/80 font-hind">
                    {consultation.issue}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold font-hind ${
                        consultation.status === "pending"
                          ? "bg-orange-500/10 text-orange-500"
                          : consultation.status === "approved"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-green-500/10 text-green-500"
                      }`}
                    >
                      {consultation.status === "pending"
                        ? "পেন্ডিং"
                        : consultation.status === "approved"
                        ? "অনুমোদিত"
                        : "সম্পন্ন"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-[var(--text)]/80 font-hind">
                    {consultation.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
