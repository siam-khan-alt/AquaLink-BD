"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  Search,
  Filter,
  Calendar,
  ShieldCheck,
  XCircle,
  CheckCircle,
  ChevronDown,
  Download,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { AuditLogsResponse } from "@/app/api/admin/audit-logs/route";

const getStatusColor = (status: string): string => {
  switch (status) {
    case "success":
      return "bg-green-100 text-green-700 border-green-200";
    case "failure":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "success":
      return <CheckCircle className="w-4 h-4" />;
    case "failure":
      return <XCircle className="w-4 h-4" />;
    default:
      return null;
  }
};

export default function AuditLogsPage() {
  const { status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data: auditData, isLoading, error } = useQuery({
    queryKey: ["admin-audit-logs", page, statusFilter, actionFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        skip: (page * limit).toString(),
      });
      if (statusFilter) params.append("status", statusFilter);
      if (actionFilter) params.append("action", actionFilter);
      
      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch audit logs");
      return res.json() as Promise<AuditLogsResponse>;
    },
    enabled: status === "authenticated",
  });

  // Filter logs by search term
  const filteredLogs = useMemo(() => {
    if (!auditData) return [];
    if (!searchTerm) return auditData.logs;
    
    const term = searchTerm.toLowerCase();
    return auditData.logs.filter(
      (log) =>
        log.action.toLowerCase().includes(term) ||
        log.resource.toLowerCase().includes(term) ||
        log.userRole.toLowerCase().includes(term) ||
        log.ipAddress.includes(term)
    );
  }, [auditData, searchTerm]);

  // Get unique actions for filter dropdown
  const uniqueActions = useMemo(() => {
    if (!auditData) return [];
    const actions = new Set(auditData.logs.map((log) => log.action));
    return Array.from(actions).sort();
  }, [auditData]);

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--border)] rounded w-1/3" />
          <div className="h-12 bg-[var(--border)] rounded" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[var(--border)] rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !auditData) {
    return (
      <div className="p-6">
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-3 text-red-600">
            <ShieldCheck className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Failed to load audit logs</h3>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">অডিট লগ</h1>
          <p className="text-[var(--text)]/60 mt-1">System activity and security events</p>
        </div>
        <Button className="bg-[var(--primary)] text-white">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-[var(--surface)] border-[var(--border)]">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)]/40 w-4 h-4" />
            <Input
              placeholder="Search by action, resource, role, or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[var(--background)] border-[var(--border)] text-[var(--text)]"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)]/40 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-[var(--background)] border-[var(--border)] rounded-lg text-[var(--text)] appearance-none cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text)]/40 w-4 h-4 pointer-events-none" />
          </div>

          {/* Action Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)]/40 w-4 h-4" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-[var(--background)] border-[var(--border)] rounded-lg text-[var(--text)] appearance-none cursor-pointer"
            >
              <option value="">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text)]/40 w-4 h-4 pointer-events-none" />
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="bg-[var(--surface)] border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--background)] border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text)]/60 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text)]/60 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text)]/60 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text)]/60 uppercase tracking-wider">
                  Actor
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text)]/60 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text)]/60 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--text)]/60">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-[var(--background)] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text)]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[var(--text)]/40" />
                        {formatDate(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text)]">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text)]/80">
                      {log.resource}
                      {log.resourceId && (
                        <span className="text-[var(--text)]/40 ml-1">({log.resourceId.slice(0, 8)}...)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text)]/80">
                      <div className="flex flex-col">
                        <span className="font-medium">{log.userRole}</span>
                        <span className="text-xs text-[var(--text)]/40">{log.userId.slice(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text)]/80 font-mono">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          log.status
                        )}`}
                      >
                        {getStatusIcon(log.status)}
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between">
          <p className="text-sm text-[var(--text)]/60">
            Showing {filteredLogs.length} of {auditData.total} logs
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="bg-[var(--background)] border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)]"
            >
              Previous
            </Button>
            <Button
              onClick={() => setPage((p) => p + 1)}
              disabled={(page + 1) * limit >= auditData.total}
              className="bg-[var(--background)] border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)]"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
