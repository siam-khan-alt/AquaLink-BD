"use client";

import { useSession } from "next-auth/react";
import { UserRole } from "@/shared/lib/rbac";

/**
 * Centralized hook for fetching user role from session
 * Ensures consistent role state across all components
 */
export function useUserRole(): UserRole | null {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (!session?.user?.role) {
    console.warn("[useUserRole] No role found in session, defaulting to farmer");
    return "farmer";
  }

  return session.user.role as UserRole;
}
