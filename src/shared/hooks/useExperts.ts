import { useQuery } from "@tanstack/react-query";

export interface Expert {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  specialization: string;
  consultationFee?: number;
  bio?: string;
  image?: string;
  isVerified: boolean;
  createdAt: string;
}

interface ExpertsResponse {
  experts: Expert[];
}

export const useExperts = (options?: { enabled?: boolean }) => {
  return useQuery<ExpertsResponse>({
    queryKey: ["experts"],
    queryFn: async () => {
      const res = await fetch("/api/home/experts");
      if (!res.ok) throw new Error("Failed to fetch experts");
      return res.json();
    },
    ...options,
  });
};
