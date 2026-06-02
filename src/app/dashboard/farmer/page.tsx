"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { usePondData } from "./hooks/usePondData";
import { useAlerts } from "./hooks/useAlerts";
import { useChartData } from "./hooks/useChartData";
import { StatsCards } from "./components/StatsCards";
import { PondHealthIndex } from "./components/PondHealthIndex";
import { InvestmentChart } from "./components/InvestmentChart";
import { EmergencyAlerts } from "./components/EmergencyAlerts";
import { PondList } from "./components/PondList";
import { AddPondModal } from "./components/AddPondModal";
import { SkeletonStats, SkeletonCard } from "@/components/ui/SkeletonCard";

export default function FarmerDashboard() {
  const { status } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: pondsData, isLoading: pondsLoading } = usePondData();
  const { data: alertsData, isLoading: alertsLoading } = useAlerts();
  const { data: chartData, isLoading: chartLoading } = useChartData();

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

  const stats = statsData?.data || {
    totalPonds: 0,
    totalActiveSpecies: 0,
    totalExpenses: 0,
    averagePH: 0,
  };

  const ponds = pondsData?.data || [];
  const alerts = alertsData?.data?.alerts || [];
  const chart = chartData?.data?.data || [];

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

        {/* Stats Cards */}
        <StatsCards stats={stats} isLoading={statsLoading} />

        {/* Emergency Alerts */}
        {!alertsLoading && alerts.length > 0 && (
          <EmergencyAlerts alerts={alerts} isLoading={alertsLoading} />
        )}

        {/* Pond Health Index */}
        <PondHealthIndex ponds={ponds} isLoading={pondsLoading} />

        {/* Investment Chart */}
        <InvestmentChart data={chart} isLoading={chartLoading} />

        {/* Pond List */}
        <PondList
          ponds={ponds}
          isLoading={pondsLoading}
          onAddPond={() => setIsModalOpen(true)}
        />

        {/* Add Pond Modal */}
        <AddPondModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          existingPonds={ponds}
        />
      </div>
    </div>
  );
}
