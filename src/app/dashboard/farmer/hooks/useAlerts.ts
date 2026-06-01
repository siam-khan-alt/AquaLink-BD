/**
 * Custom hook for fetching emergency alerts
 * Uses TanStack Query with optimized refetching
 * Note: Using refetchInterval as temporary solution until WebSockets are implemented
 */

import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/shared/types/api-responses";

export interface EmergencyAlert {
  _id: string;
  region: string;
  title: string;
  detail: string;
  level: "info" | "warning" | "error" | "critical";
  isActive: boolean;
  createdAt: Date;
}

export const useAlerts = () => {
  return useQuery<ApiResponse<{ alerts: EmergencyAlert[] }>>({
    queryKey: ["alerts"],
    queryFn: async () => {
      const res = await fetch("/api/home/alerts");
      if (!res.ok) {
        throw new Error("Failed to fetch alerts");
      }
      return res.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - alerts need to be relatively fresh
    // TODO: Replace with WebSocket/Pusher for real-time updates
    // Using refetchInterval as temporary solution
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    retry: 1,
    retryDelay: 1000,
  });
};
