/**
 * useConsultations Hook
 * Fetches consultation requests using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { ConsultationStatus } from '../lib/consultation-state-machine';

export interface ConsultationRequest {
  id: string;
  farmerName: string;
  farmerPhone: string;
  pondName: string;
  issue: string;
  description: string;
  images?: string[];
  status: ConsultationStatus;
  requestedAt: string;
  fee: number;
  farmerId: string;
  doctorId?: string;
}

export interface ConsultationsResponse {
  consultations: ConsultationRequest[];
  total: number;
  page: number;
  limit: number;
}

const QUERY_CONFIG = {
  STALE_TIME: 1 * 60 * 1000, // 1 minute
  REFRESH_INTERVAL: 30 * 1000, // 30 seconds
};

export const useConsultations = (consultationStatus?: ConsultationStatus, page: number = 1, limit: number = 20) => {
  const { data: session, status: sessionStatus } = useSession();

  const queryParams = new URLSearchParams();
  if (consultationStatus) queryParams.append('status', consultationStatus);
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());

  return useQuery<ConsultationsResponse>({
    queryKey: ['doctor-consultations', session?.user?.id, consultationStatus, page, limit],
    queryFn: async () => {
      const response = await fetch(`/api/doctor/consultations?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch consultations');
      }
      const data = await response.json();
      return data;
    },
    enabled: sessionStatus === 'authenticated' && !!session?.user?.id,
    staleTime: QUERY_CONFIG.STALE_TIME,
    refetchInterval: QUERY_CONFIG.REFRESH_INTERVAL,
  });
};

export const useUpdateConsultationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ consultationId, status, action }: { consultationId: string; status: ConsultationStatus; action: string }) => {
      const response = await fetch(`/api/doctor/consultations/${consultationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, action }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update consultation status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-consultations'] });
    },
  });
};

export const useBulkUpdateConsultations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ consultationIds, status, action }: { consultationIds: string[]; status: ConsultationStatus; action: string }) => {
      const response = await fetch('/api/doctor/consultations/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultationIds, status, action }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to bulk update consultations');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-consultations'] });
    },
  });
};
