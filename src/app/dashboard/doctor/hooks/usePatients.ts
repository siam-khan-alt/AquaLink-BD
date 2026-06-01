/**
 * usePatients Hook
 * Fetches patient data using TanStack Query with server-side pagination
 */

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export interface Patient {
  id: string;
  name: string;
  phone: string;
  location: string;
  totalConsultations: number;
  lastConsultation: string;
  lastIssue: string;
}

export interface PatientsResponse {
  patients: Patient[];
  total: number;
  page: number;
  limit: number;
}

const QUERY_CONFIG = {
  STALE_TIME: 3 * 60 * 1000, // 3 minutes
  REFRESH_INTERVAL: 60 * 1000, // 1 minute
};

export const usePatients = (page: number = 1, limit: number = 20, search?: string) => {
  const { data: session, status } = useSession();

  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  if (search) queryParams.append('search', search);

  return useQuery<PatientsResponse>({
    queryKey: ['doctor-patients', session?.user?.id, page, limit, search],
    queryFn: async () => {
      const response = await fetch(`/api/doctor/patients?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      const data = await response.json();
      return data;
    },
    enabled: status === 'authenticated' && !!session?.user?.id,
    staleTime: QUERY_CONFIG.STALE_TIME,
    refetchInterval: QUERY_CONFIG.REFRESH_INTERVAL,
  });
};
