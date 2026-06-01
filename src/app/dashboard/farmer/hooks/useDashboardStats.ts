/**
 * Custom hook for fetching dashboard statistics
 * Uses TanStack Query with optimized caching and refetching
 */

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ApiResponse } from "@/shared/types/api-responses";

export interface DashboardStats {
  totalPonds: number;
  totalActiveSpecies: number;
  totalExpenses: number;
  averagePH: number;
}

export const useDashboardStats = () => {
  const { data: session, status } = useSession();

  return useQuery<ApiResponse<DashboardStats>>({
    queryKey: ["ponds-stats"],
    queryFn: async () => {
      const res = await fetch("/api/ponds/stats");
      if (!res.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      return res.json();
    },
    enabled: status === "authenticated",
    staleTime: 5 * 60 * 1000, // 5 minutes - stats don't change frequently
    refetchInterval: false, // No automatic refetch - user can manually refresh
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
