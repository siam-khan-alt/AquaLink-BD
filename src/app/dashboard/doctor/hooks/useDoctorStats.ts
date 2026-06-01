/**
 * useDoctorStats Hook
 * Fetches doctor statistics using TanStack Query
 */

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export interface DoctorStats {
  totalConsultations: number;
  pendingConsultations: number;
  completedConsultations: number;
  totalEarnings: number;
  thisMonthEarnings: number;
  averageRating: number;
  totalPatients: number;
}

const QUERY_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  REFRESH_INTERVAL: 2 * 60 * 1000, // 2 minutes
};

export const useDoctorStats = () => {
  const { data: session, status } = useSession();

  return useQuery<DoctorStats>({
    queryKey: ['doctor-stats', session?.user?.id],
    queryFn: async () => {
      const response = await fetch('/api/doctor/earnings');
      if (!response.ok) {
        throw new Error('Failed to fetch doctor stats');
      }
      const data = await response.json();
      return data;
    },
    enabled: status === 'authenticated' && !!session?.user?.id,
    staleTime: QUERY_CONFIG.STALE_TIME,
    refetchInterval: QUERY_CONFIG.REFRESH_INTERVAL,
  });
};
