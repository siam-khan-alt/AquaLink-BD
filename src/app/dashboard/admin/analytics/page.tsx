"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Calendar,
} from "lucide-react";
import Card from "@/components/ui/Card";
import type { AnalyticsMetrics } from "@/app/api/admin/analytics/route";

const COLORS = ["#0f6a6b", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AnalyticsPage() {
  const { status } = useSession();

  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics?days=30");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json() as Promise<AnalyticsMetrics>;
    },
    enabled: status === "authenticated",
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  });

  // Transform revenue data for AreaChart
  const revenueChartData = useMemo(() => {
    if (!analyticsData) return [];
    return Object.entries(analyticsData.revenue.bySource).map(([source, amount]) => ({
      name: source,
      revenue: amount as number,
    }));
  }, [analyticsData]);

  // Transform conversion data for BarChart
  const conversionChartData = useMemo(() => {
    if (!analyticsData) return [];
    return Object.entries(analyticsData.conversions.byFunnel).map(([funnel, count]) => ({
      name: funnel,
      conversions: count as number,
    }));
  }, [analyticsData]);

  // Transform user engagement data for PieChart
  const engagementChartData = useMemo(() => {
    if (!analyticsData) return [];
    return [
      { name: "DAU", value: analyticsData.userEngagement.dau },
      { name: "MAU", value: analyticsData.userEngagement.mau - analyticsData.userEngagement.dau },
    ];
  }, [analyticsData]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--border)] rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-[var(--border)] rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-80 bg-[var(--border)] rounded-lg" />
            <div className="h-80 bg-[var(--border)] rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="p-6">
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-3 text-red-600">
            <Activity className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Failed to load analytics</h3>
              <p className="text-sm text-red-500">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">অ্যানালিটিক্স ড্যাশবোর্ড</h1>
        <p className="text-[var(--text)]/60 mt-1">Revenue, conversions, and user engagement metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revenue Card */}
        <Card className="p-6 bg-[var(--surface)] border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text)]/60">Total Revenue</p>
              <p className="text-2xl font-bold text-[var(--text)]">
                ৳ {analyticsData.revenue.total.toLocaleString()}
              </p>
              <p className={`text-sm mt-1 ${analyticsData.revenue.growth >= 0 ? "text-green-500" : "text-red-500"}`}>
                {analyticsData.revenue.growth >= 0 ? "+" : ""}
                {analyticsData.revenue.growth.toFixed(1)}% vs last month
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-[var(--primary)]" />
          </div>
        </Card>

        {/* Conversions Card */}
        <Card className="p-6 bg-[var(--surface)] border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text)]/60">Total Conversions</p>
              <p className="text-2xl font-bold text-[var(--text)]">
                {analyticsData.conversions.total}
              </p>
              <p className="text-sm text-[var(--text)]/60 mt-1">
                {analyticsData.conversions.rate.toFixed(1)}% conversion rate
              </p>
            </div>
            <Users className="w-10 h-10 text-[var(--secondary)]" />
          </div>
        </Card>

        {/* User Engagement Card */}
        <Card className="p-6 bg-[var(--surface)] border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text)]/60">DAU/MAU Ratio</p>
              <p className="text-2xl font-bold text-[var(--text)]">
                {analyticsData.userEngagement.ratio.toFixed(1)}%
              </p>
              <p className="text-sm text-[var(--text)]/60 mt-1">
                {analyticsData.userEngagement.dau} daily / {analyticsData.userEngagement.mau} monthly
              </p>
            </div>
            <Activity className="w-10 h-10 text-[var(--primary)]" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Growth Chart */}
        <Card className="p-6 bg-[var(--surface)] border-[var(--border)]">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-lg font-semibold text-[var(--text)]">Revenue by Source</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="[var(--border)]" />
              <XAxis dataKey="name" stroke="[var(--text)]/60" />
              <YAxis stroke="[var(--text)]/60" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* User Acquisition vs Churn Chart */}
        <Card className="p-6 bg-[var(--surface)] border-[var(--border)]">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-[var(--secondary)]" />
            <h2 className="text-lg font-semibold text-[var(--text)]">Conversions by Funnel</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="[var(--border)]" />
              <XAxis dataKey="name" stroke="[var(--text)]/60" />
              <YAxis stroke="[var(--text)]/60" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="conversions" fill="var(--secondary)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* User Engagement Pie Chart */}
        <Card className="p-6 bg-[var(--surface)] border-[var(--border)]">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-lg font-semibold text-[var(--text)]">User Engagement</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={engagementChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {engagementChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Total Users Card */}
        <Card className="p-6 bg-[var(--surface)] border-[var(--border)]">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-[var(--secondary)]" />
            <h2 className="text-lg font-semibold text-[var(--text)]">Total Users</h2>
          </div>
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <p className="text-5xl font-bold text-[var(--primary)]">
                {analyticsData.userEngagement.totalUsers.toLocaleString()}
              </p>
              <p className="text-[var(--text)]/60 mt-2">Registered users</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Last Updated */}
      <p className="text-sm text-[var(--text)]/40 text-center">
        Last updated: {new Date(analyticsData.timestamp).toLocaleString()}
      </p>
    </div>
  );
}
