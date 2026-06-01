/**
 * Custom hook for fetching chart data
 * Uses TanStack Query with optimized caching
 */

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ApiResponse } from "@/shared/types/api-responses";

export interface ChartDataPoint {
  name: string;
  "খাদ্য (Feed)": number;
  "সার (Fertilizer)": number;
  "অন্যান্য (Other)": number;
}

export const useChartData = () => {
  const { data: session, status } = useSession();

  return useQuery<ApiResponse<{ data: ChartDataPoint[] }>>({
    queryKey: ["chart-data"],
    queryFn: async () => {
      const res = await fetch("/api/ponds/chart-data");
      if (!res.ok) {
        throw new Error("Failed to fetch chart data");
      }
      return res.json();
    },
    enabled: status === "authenticated",
    staleTime: 10 * 60 * 1000, // 10 minutes - historical data doesn't change
    refetchInterval: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
