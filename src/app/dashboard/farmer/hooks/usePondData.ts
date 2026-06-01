/**
 * Custom hook for fetching pond data
 * Uses TanStack Query with optimized caching
 */

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ApiResponse } from "@/shared/types/api-responses";
import { IPond } from "@/models/Pond";

export const usePondData = () => {
  const { data: session, status } = useSession();

  return useQuery<ApiResponse<IPond[]>>({
    queryKey: ["ponds-list"],
    queryFn: async () => {
      const res = await fetch("/api/ponds/list");
      if (!res.ok) {
        throw new Error("Failed to fetch pond data");
      }
      return res.json();
    },
    enabled: status === "authenticated",
    staleTime: 3 * 60 * 1000, // 3 minutes - pond data changes moderately
    refetchInterval: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
