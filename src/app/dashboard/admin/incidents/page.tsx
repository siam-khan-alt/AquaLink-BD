"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  AlertTriangle,
  Plus,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Incident {
  _id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved" | "closed";
  category: string;
  reportedBy: string;
  startedAt: Date;
  resolvedAt?: Date;
  metadata?: Record<string, unknown>;
}

interface IncidentsResponse {
  incidents: Incident[];
  total: number;
  limit: number;
  skip: number;
}

const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-700 border-red-200";
    case "high":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "medium":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "low":
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case "open":
      return "bg-red-100 text-red-700 border-red-200";
    case "investigating":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "resolved":
      return "bg-green-100 text-green-700 border-green-200";
    case "closed":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "open":
      return <AlertTriangle className="w-4 h-4" />;
    case "investigating":
      return <Clock className="w-4 h-4" />;
    case "resolved":
      return <CheckCircle className="w-4 h-4" />;
    case "closed":
      return <CheckCircle className="w-4 h-4" />;
    default:
      return null;
  }
};

export default function IncidentsPage() {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const limit = 20;

  const { data: incidentsData, isLoading, error } = useQuery({
    queryKey: ["admin-incidents", page, statusFilter, severityFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        skip: (page * limit).toString(),
      });
      if (statusFilter) params.append("status", statusFilter);
      if (severityFilter) params.append("severity", severityFilter);

      const res = await fetch(`/api/admin/incidents?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch incidents");
      return res.json() as Promise<IncidentsResponse>;
    },
    enabled: status === "authenticated",
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ incidentId, newStatus }: { incidentId: string; newStatus: string }) => {
      const res = await fetch(`/api/admin/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update incident status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-incidents"] });
      setShowStatusModal(false);
      setSelectedIncident(null);
    },
  });

  const handleStatusChange = (incident: Incident, newStatus: string) => {
    setSelectedIncident(incident);
    updateStatusMutation.mutate({ incidentId: incident._id, newStatus });
  };

  // Filter incidents by search term
  const filteredIncidents = incidentsData?.incidents.filter(
    (incident) =>
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Group incidents by status for Kanban view
  const kanbanColumns = {
    open: filteredIncidents.filter((i) => i.status === "open"),
    investigating: filteredIncidents.filter((i) => i.status === "investigating"),
    resolved: filteredIncidents.filter((i) => i.status === "resolved"),
    closed: filteredIncidents.filter((i) => i.status === "closed"),
  };

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
              <div key={i} className="h-24 bg-[var(--border)] rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !incidentsData) {
    return (
      <div className="p-6">
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Failed to load incidents</h3>
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
          <h1 className="text-2xl font-bold text-[var(--text)]">ইনসিডেন্ট ম্যানেজমেন্ট</h1>
          <p className="text-[var(--text)]/60 mt-1">Track and resolve system incidents</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setViewMode(viewMode === "list" ? "kanban" : "list")}
            className="bg-[var(--background)] border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)]"
          >
            {viewMode === "list" ? "Kanban View" : "List View"}
          </Button>
          <Button className="bg-[var(--primary)] text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Incident
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-[var(--surface)] border-[var(--border)]">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)]/40 w-4 h-4" />
            <Input
              placeholder="Search incidents..."
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
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)]/40 w-4 h-4" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-[var(--background)] border-[var(--border)] rounded-lg text-[var(--text)] appearance-none cursor-pointer"
            >
              <option value="">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </Card>

      {/* List View */}
      {viewMode === "list" && (
        <Card className="bg-[var(--surface)] border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--background)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text)]/60 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text)]/60 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text)]/60 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text)]/60 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text)]/60 uppercase tracking-wider">
                    Reported By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text)]/60 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text)]/60 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[var(--text)]/60">
                      No incidents found
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map((incident) => (
                    <tr key={incident._id} className="hover:bg-[var(--background)] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[var(--text)]">{incident.title}</p>
                          <p className="text-sm text-[var(--text)]/60">{incident.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                            incident.severity
                          )}`}
                        >
                          {incident.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            incident.status
                          )}`}
                        >
                          {getStatusIcon(incident.status)}
                          {incident.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text)]/80">
                        {incident.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text)]/80">
                        {incident.reportedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text)]/80">
                        {formatDate(incident.startedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <select
                            value={incident.status}
                            onChange={(e) => handleStatusChange(incident, e.target.value)}
                            className="text-xs px-2 py-1 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text)] cursor-pointer"
                            disabled={updateStatusMutation.isPending}
                          >
                            <option value="open">Open</option>
                            <option value="investigating">Investigating</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                          <Button
                            size="sm"
                            className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
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
      )}

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(kanbanColumns).map(([status, incidents]) => (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[var(--text)] capitalize">
                  {status.replace("-", " ")}
                </h3>
                <span className="text-sm text-[var(--text)]/60 bg-[var(--background)] px-2 py-1 rounded">
                  {incidents.length}
                </span>
              </div>
              <div className="space-y-3">
                {incidents.map((incident) => (
                  <Card
                    key={incident._id}
                    className="p-4 bg-[var(--surface)] border-[var(--border)] hover:border-[var(--primary)] transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                          incident.severity
                        )}`}
                      >
                        {incident.severity}
                      </span>
                      <button className="text-[var(--text)]/40 hover:text-[var(--text)]">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <h4 className="font-medium text-[var(--text)] mb-1">{incident.title}</h4>
                    <p className="text-sm text-[var(--text)]/60 mb-3">{incident.description}</p>
                    <div className="flex items-center justify-between text-xs text-[var(--text)]/40">
                      <span>{incident.category}</span>
                      <span>{formatDate(incident.startedAt)}</span>
                    </div>
                  </Card>
                ))}
                {incidents.length === 0 && (
                  <div className="p-4 text-center text-[var(--text)]/40 text-sm">
                    No incidents
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text)]/60">
          Showing {filteredIncidents.length} of {incidentsData.total} incidents
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
            disabled={(page + 1) * limit >= incidentsData.total}
            className="bg-[var(--background)] border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)]"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
