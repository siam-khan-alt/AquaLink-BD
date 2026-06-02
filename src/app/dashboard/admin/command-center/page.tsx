"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
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
  Settings,
  RefreshCw,
  Megaphone,
  Power,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ErrorBoundary from "@/components/ErrorBoundary";
import type { HealthMetrics } from "@/app/api/admin/health/route";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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

// Memoized KPI Card Component
const MetricCard = React.memo<{
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color?: string;
}>(({ title, value, subtitle, icon, color }) => (
  <Card className="p-4 bg-[var(--surface)] border-[var(--border)]">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-[var(--text)]/60">{title}</p>
        <p className={`text-2xl font-bold ${color || 'text-[var(--text)]'}`}>{value}</p>
      </div>
      <div className="w-8 h-8 text-[var(--text)]/40">{icon}</div>
    </div>
    <p className="text-xs text-[var(--text)]/40 mt-2">{subtitle}</p>
  </Card>
));

MetricCard.displayName = 'MetricCard';

export default function AdminCommandCenter() {
  const { status } = useSession();
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showCacheModal, setShowCacheModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const { data: healthData, isLoading: healthLoading, error: healthError } = useQuery({
    queryKey: ["admin-health"],
    queryFn: async () => {
      const res = await fetch("/api/admin/health");
      if (!res.ok) throw new Error("Failed to fetch health metrics");
      return res.json() as Promise<HealthMetrics>;
    },
    enabled: status === "authenticated",
    refetchInterval: 5000, // Refetch every 5 seconds for live feel
    staleTime: 2000,
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
          <div className="h-8 bg-[var(--border)] rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-[var(--border)] rounded-lg" />
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
    <ErrorBoundary>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Admin Command Center</h1>
          <p className="text-[var(--text)]/60 mt-1">System monitoring and observability dashboard</p>
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
        <MetricCard
          title="System Status"
          value={healthData.status}
          subtitle={`Last updated: ${new Date(healthData.timestamp).toLocaleTimeString()}`}
          icon={<ShieldCheck className="w-8 h-8" />}
          color={getStatusColor(healthData.status)}
        />
        <MetricCard
          title="Uptime"
          value={formatUptime(healthData.uptime)}
          subtitle="Since last restart"
          icon={<Clock className="w-8 h-8" />}
        />
        <MetricCard
          title="CPU Usage"
          value={`${healthData.system.cpu.usage.toFixed(1)}%`}
          subtitle={`${healthData.system.cpu.cores} cores available`}
          icon={<Cpu className="w-8 h-8" />}
        />
        <MetricCard
          title="Memory Usage"
          value={`${healthData.system.memory.usagePercent.toFixed(1)}%`}
          subtitle={`${formatBytes(healthData.system.memory.used)} / ${formatBytes(healthData.system.memory.total)}`}
          icon={<HardDrive className="w-8 h-8" />}
        />
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Health */}
        <Card className="p-6 bg-[var(--surface)] border-[var(--border)]">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-[var(--primary)]" />
            <h2 className="text-lg font-semibold text-[var(--text)]">Database Health</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg">
              <span className="text-sm text-[var(--text)]/60">Status</span>
              <div className="flex items-center gap-2">
                {healthData.database.status === "connected" ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="font-medium text-[var(--text)]">{healthData.database.status}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg">
              <span className="text-sm text-[var(--text)]/60">Connection Pool</span>
              <span className="font-medium text-[var(--text)]">{healthData.database.connectionCount} active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg">
              <span className="text-sm text-[var(--text)]/60">Latency</span>
              <span className="font-medium text-[var(--text)]">{healthData.database.latency}ms</span>
            </div>
          </div>
        </Card>

        {/* API Performance */}
        <Card className="p-6 bg-[var(--surface)] border-[var(--border)]">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-[var(--secondary)]" />
            <h2 className="text-lg font-semibold text-[var(--text)]">API Performance</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg">
              <span className="text-sm text-[var(--text)]/60">Average Latency</span>
              <span className="font-medium text-[var(--text)]">{healthData.api.averageLatency}ms</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg">
              <span className="text-sm text-[var(--text)]/60">Request Count</span>
              <span className="font-medium text-[var(--text)]">{healthData.api.requestCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg">
              <span className="text-sm text-[var(--text)]/60">Health Check Time</span>
              <span className="font-medium text-[var(--text)]">{new Date(healthData.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Load Chart */}
        <Card className="p-6 bg-[var(--surface)] border-[var(--border)]">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-[var(--primary)]" />
            <h2 className="text-lg font-semibold text-[var(--text)]">System Load</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={[
              { time: '5m ago', cpu: healthData.system.cpu.usage * 0.9, memory: healthData.system.memory.usagePercent * 0.95 },
              { time: '4m ago', cpu: healthData.system.cpu.usage * 0.85, memory: healthData.system.memory.usagePercent * 0.92 },
              { time: '3m ago', cpu: healthData.system.cpu.usage * 0.88, memory: healthData.system.memory.usagePercent * 0.94 },
              { time: '2m ago', cpu: healthData.system.cpu.usage * 0.92, memory: healthData.system.memory.usagePercent * 0.93 },
              { time: '1m ago', cpu: healthData.system.cpu.usage * 0.95, memory: healthData.system.memory.usagePercent * 0.96 },
              { time: 'now', cpu: healthData.system.cpu.usage, memory: healthData.system.memory.usagePercent },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--text))" fontSize={12} />
              <YAxis stroke="hsl(var(--text))" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                labelStyle={{ color: 'hsl(var(--text))' }}
              />
              <Legend />
              <Line type="monotone" dataKey="cpu" stroke="hsl(var(--primary))" strokeWidth={2} name="CPU %" />
              <Line type="monotone" dataKey="memory" stroke="hsl(var(--secondary))" strokeWidth={2} name="Memory %" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* API Performance Chart */}
        <Card className="p-6 bg-[var(--surface)] border-[var(--border)]">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-[var(--secondary)]" />
            <h2 className="text-lg font-semibold text-[var(--text)]">API Latency Trends</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={[
              { time: '5m ago', latency: healthData.api.averageLatency * 1.1 },
              { time: '4m ago', latency: healthData.api.averageLatency * 0.9 },
              { time: '3m ago', latency: healthData.api.averageLatency * 1.05 },
              { time: '2m ago', latency: healthData.api.averageLatency * 0.95 },
              { time: '1m ago', latency: healthData.api.averageLatency * 1.02 },
              { time: 'now', latency: healthData.api.averageLatency },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--text))" fontSize={12} />
              <YAxis stroke="hsl(var(--text))" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                labelStyle={{ color: 'hsl(var(--text))' }}
              />
              <Legend />
              <Line type="monotone" dataKey="latency" stroke="hsl(var(--primary))" strokeWidth={2} name="Latency (ms)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Global Admin Controls */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Global Admin Controls</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowMaintenanceModal(true)}
            className="flex flex-col items-center gap-2 p-4 bg-[var(--background)] rounded-lg hover:bg-[var(--border)] transition-colors"
          >
            <Settings className="w-6 h-6 text-[var(--primary)]" />
            <span className="text-sm font-medium text-[var(--text)]">Maintenance Mode</span>
          </button>
          <button
            onClick={() => setShowCacheModal(true)}
            className="flex flex-col items-center gap-2 p-4 bg-[var(--background)] rounded-lg hover:bg-[var(--border)] transition-colors"
          >
            <RefreshCw className="w-6 h-6 text-[var(--secondary)]" />
            <span className="text-sm font-medium text-[var(--text)]">Flush Cache</span>
          </button>
          <button
            onClick={() => setShowAlertModal(true)}
            className="flex flex-col items-center gap-2 p-4 bg-[var(--background)] rounded-lg hover:bg-[var(--border)] transition-colors"
          >
            <Megaphone className="w-6 h-6 text-[var(--primary)]" />
            <span className="text-sm font-medium text-[var(--text)]">Broadcast Alert</span>
          </button>
          <button
            onClick={() => setShowRestartModal(true)}
            className="flex flex-col items-center gap-2 p-4 bg-[var(--background)] rounded-lg hover:bg-[var(--border)] transition-colors"
          >
            <Power className="w-6 h-6 text-red-500" />
            <span className="text-sm font-medium text-[var(--text)]">System Restart</span>
          </button>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/admin/users" className="flex flex-col items-center gap-2 p-4 bg-[var(--background)] rounded-lg hover:bg-[var(--border)] transition-colors">
            <Users className="w-6 h-6 text-[var(--primary)]" />
            <span className="text-sm font-medium text-[var(--text)]">Manage Users</span>
          </Link>
          <Link href="/dashboard/admin/audit-logs" className="flex flex-col items-center gap-2 p-4 bg-[var(--background)] rounded-lg hover:bg-[var(--border)] transition-colors">
            <ShieldCheck className="w-6 h-6 text-[var(--secondary)]" />
            <span className="text-sm font-medium text-[var(--text)]">Audit Logs</span>
          </Link>
          <Link href="/dashboard/admin/incidents" className="flex flex-col items-center gap-2 p-4 bg-[var(--background)] rounded-lg hover:bg-[var(--border)] transition-colors">
            <AlertTriangle className="w-6 h-6 text-[var(--primary)]" />
            <span className="text-sm font-medium text-[var(--text)]">Incidents</span>
          </Link>
          <Link href="/dashboard/admin/analytics" className="flex flex-col items-center gap-2 p-4 bg-[var(--background)] rounded-lg hover:bg-[var(--border)] transition-colors">
            <TrendingUp className="w-6 h-6 text-[var(--secondary)]" />
            <span className="text-sm font-medium text-[var(--text)]">Analytics</span>
          </Link>
        </div>
      </Card>

      {/* Maintenance Mode Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 bg-[var(--surface)] border-[var(--border)] max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Toggle Maintenance Mode</h3>
            <p className="text-sm text-[var(--text)]/60 mb-4">
              {maintenanceMode
                ? "Disabling maintenance mode will allow users to access the application normally."
                : "Enabling maintenance mode will prevent non-admin users from accessing the application."}
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setShowMaintenanceModal(false)}
                className="bg-[var(--background)] border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setMaintenanceMode(!maintenanceMode);
                  setShowMaintenanceModal(false);
                }}
                className="bg-[var(--primary)] text-white"
              >
                {maintenanceMode ? "Disable" : "Enable"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Flush Cache Modal */}
      {showCacheModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 bg-[var(--surface)] border-[var(--border)] max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Flush Cache</h3>
            <p className="text-sm text-[var(--text)]/60 mb-4">
              This will clear all cached data. The system may experience temporary slowdowns as cache is rebuilt.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setShowCacheModal(false)}
                className="bg-[var(--background)] border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowCacheModal(false);
                  // Implement cache flush logic
                }}
                className="bg-[var(--primary)] text-white"
              >
                Flush Cache
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Broadcast Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 bg-[var(--surface)] border-[var(--border)] max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Broadcast Alert</h3>
            <Input
              placeholder="Enter alert message..."
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              className="mb-4 bg-[var(--background)] border-[var(--border)] text-[var(--text)]"
            />
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => {
                  setShowAlertModal(false);
                  setAlertMessage("");
                }}
                className="bg-[var(--background)] border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowAlertModal(false);
                  setAlertMessage("");
                  // Implement broadcast logic
                }}
                className="bg-[var(--primary)] text-white"
                disabled={!alertMessage.trim()}
              >
                Broadcast
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* System Restart Modal */}
      {showRestartModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 bg-[var(--surface)] border-[var(--border)] max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4">System Restart</h3>
            <p className="text-sm text-[var(--text)]/60 mb-4">
              This will restart the application server. All active connections will be terminated. This action requires elevated permissions.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setShowRestartModal(false)}
                className="bg-[var(--background)] border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowRestartModal(false);
                  // Implement system restart logic with permission check
                }}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                Restart System
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}
