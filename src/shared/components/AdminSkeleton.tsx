/**
 * Admin Skeleton Components
 * 
 * Generic skeleton screens for admin dashboard loading states.
 * Provides better UX than simple spinners by showing content structure.
 */

import React from "react";

interface AdminCardSkeletonProps {
  count?: number;
}

export const AdminCardSkeleton: React.FC<AdminCardSkeletonProps> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl animate-pulse"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-[var(--border)] rounded-xl" />
            <div className="w-8 h-8 bg-[var(--border)] rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-[var(--border)] rounded w-24" />
            <div className="h-8 bg-[var(--border)] rounded w-16" />
          </div>
          <div className="h-3 bg-[var(--border)] rounded w-32 mt-4" />
        </div>
      ))}
    </div>
  );
};

interface AdminTableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const AdminTableSkeleton: React.FC<AdminTableSkeletonProps> = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="h-8 bg-[var(--border)] rounded w-48 animate-pulse" />
      
      {/* Table skeleton */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="px-6 py-4">
                    <div className="h-4 bg-[var(--border)] rounded w-24 animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-[var(--border)]/50">
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      <div className="h-4 bg-[var(--border)] rounded w-full animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface AdminGridSkeletonProps {
  count?: number;
}

export const AdminGridSkeleton: React.FC<AdminGridSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--surface)] border border-[var(--border)]/60 rounded-2xl h-80 animate-pulse"
        >
          <div className="w-full h-44 bg-[var(--border)] border-b border-[var(--border)]/40" />
          <div className="p-5 space-y-4">
            <div className="h-6 bg-[var(--border)] rounded w-3/4" />
            <div className="h-4 bg-[var(--border)] rounded w-full" />
            <div className="h-4 bg-[var(--border)] rounded w-1/2" />
            <div className="h-4 bg-[var(--border)] rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

interface AdminStatsCardSkeletonProps {
  count?: number;
}

export const AdminStatsCardSkeleton: React.FC<AdminStatsCardSkeletonProps> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl animate-pulse hover:scale-[1.02] transition-transform duration-300"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-[var(--border)] rounded-xl" />
            <div className="w-8 h-8 bg-[var(--border)] rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-[var(--border)] rounded w-20" />
            <div className="h-8 bg-[var(--border)] rounded w-24" />
          </div>
          <div className="h-3 bg-[var(--border)] rounded w-28 mt-4" />
        </div>
      ))}
    </div>
  );
};
