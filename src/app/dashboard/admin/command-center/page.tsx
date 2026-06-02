"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  Activity,
  Cpu,
  Database,
  HardDrive,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react";
import Card from "@/components/ui/Card";
import type { HealthMetrics } from "@/app/api/admin/health/route";

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Number((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export default function AdminCommandCenter() {
  const { status } = useSession();

  const { data: healthData, isLoading: healthLoading, error: healthError } = useQuery({
    queryKey: ["admin-health"],
    queryFn: async () => {
      const res = await fetch("/api/admin/health");
      if (!res.ok) throw new Error("Failed to fetch health metrics");
      return res.json() as Promise<HealthMetrics>;
    },
    enabled: status === "authenticated",
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000,
  });

  const getStatusColor = (status: HealthMetrics["status"]) => {
    switch (status) {
      case "healthy":
        return "text-green-500";
      case "degraded":
        return "text-yellow-500";
      case "unhealthy":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: HealthMetrics["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "unhealthy":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  if (healthLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (healthError || !healthData) {
    return (
      <div className="p-6">
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Failed to load system metrics</h3>
              <p className="text-sm text-red-500">
                {healthError instanceof Error ? healthError.message : "Unknown error"}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Command Center</h1>
          <p className="text-gray-600 mt-1">System monitoring and observability dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(healthData.status)}
          <span className={`font-semibold ${getStatusColor(healthData.status)}`}>
            {healthData.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Status */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Status</p>
              <p className={`text-2xl font-bold ${getStatusColor(healthData.status)}`}>
                {healthData.status}
              </p>
            </div>
            <ShieldCheck className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Last updated: {new Date(healthData.timestamp).toLocaleTimeString()}</p>
        </Card>

        {/* Uptime */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-gray-900">{formatUptime(healthData.uptime)}</p>
            </div>
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Since last restart</p>
        </Card>

        {/* CPU Usage */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">CPU Usage</p>
              <p className="text-2xl font-bold text-gray-900">{healthData.system.cpu.usage.toFixed(1)}%</p>
            </div>
            <Cpu className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-2">{healthData.system.cpu.cores} cores available</p>
        </Card>

        {/* Memory Usage */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Memory Usage</p>
              <p className="text-2xl font-bold text-gray-900">{healthData.system.memory.usagePercent.toFixed(1)}%</p>
            </div>
            <HardDrive className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {formatBytes(healthData.system.memory.used)} / {formatBytes(healthData.system.memory.total)}
          </p>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Health */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold">Database Health</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Status</span>
              <div className="flex items-center gap-2">
                {healthData.database.status === "connected" ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="font-medium">{healthData.database.status}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Connection Pool</span>
              <span className="font-medium">{healthData.database.connectionCount} active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Latency</span>
              <span className="font-medium">{healthData.database.latency}ms</span>
            </div>
          </div>
        </Card>

        {/* API Performance */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-purple-500" />
            <h2 className="text-lg font-semibold">API Performance</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Average Latency</span>
              <span className="font-medium">{healthData.api.averageLatency}ms</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Request Count</span>
              <span className="font-medium">{healthData.api.requestCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Health Check Time</span>
              <span className="font-medium">{new Date(healthData.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Users className="w-6 h-6 text-blue-500" />
            <span className="text-sm font-medium">Manage Users</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <ShieldCheck className="w-6 h-6 text-green-500" />
            <span className="text-sm font-medium">Audit Logs</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            <span className="text-sm font-medium">Incidents</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <TrendingUp className="w-6 h-6 text-purple-500" />
            <span className="text-sm font-medium">Analytics</span>
          </button>
        </div>
      </Card>
    </div>
  );
}
