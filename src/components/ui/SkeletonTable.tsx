"use client";

import React from "react";

interface SkeletonTableProps {
  className?: string;
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

/**
 * SkeletonTable Component
 * 
 * A reusable skeleton loading component for table layouts.
 * Displays a pulsing placeholder while table content is loading.
 */
export function SkeletonTable({
  className = "",
  rows = 5,
  columns = 5,
  showHeader = true,
}: SkeletonTableProps) {
  const tableRows = Array.from({ length: rows }, (_, i) => i);
  const tableColumns = Array.from({ length: columns }, (_, i) => i);

  return (
    <div className={`w-full ${className}`}>
      {showHeader && (
        <div className="flex border-b border-[var(--border)] mb-2 pb-3">
          {tableColumns.map((index) => (
            <div
              key={`header-${index}`}
              className="flex-1 px-4"
            >
              <div className="h-4 bg-[var(--border)]/50 rounded w-3/4 animate-pulse" />
            </div>
          ))}
        </div>
      )}
      <div className="space-y-2">
        {tableRows.map((rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="flex border-b border-[var(--border)]/50 py-3"
          >
            {tableColumns.map((colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className="flex-1 px-4"
              >
                <div className="h-4 bg-[var(--border)]/30 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface SkeletonListProps {
  className?: string;
  count?: number;
}

/**
 * SkeletonList Component
 * 
 * A specialized skeleton for list items (like in notification lists).
 */
export function SkeletonList({ className = "", count = 5 }: SkeletonListProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((index) => (
        <div
          key={index}
          className="flex items-center gap-4 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl animate-pulse"
        >
          <div className="w-10 h-10 bg-[var(--border)]/50 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="w-3/4 h-4 bg-[var(--border)]/30 rounded" />
            <div className="w-1/2 h-3 bg-[var(--border)]/20 rounded" />
          </div>
          <div className="w-20 h-6 bg-[var(--border)]/30 rounded" />
        </div>
      ))}
    </div>
  );
}
