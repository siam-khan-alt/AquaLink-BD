"use client";

import React from "react";

interface SkeletonCardProps {
  className?: string;
  count?: number;
}

/**
 * SkeletonCard Component
 * 
 * A reusable skeleton loading component for card layouts.
 * Displays a pulsing placeholder while content is loading.
 */
export function SkeletonCard({ className = "", count = 1 }: SkeletonCardProps) {
  const cards = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {cards.map((index) => (
        <div
          key={index}
          className={`p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl animate-pulse ${className}`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-[var(--primary)]/10 rounded-xl">
              <div className="w-6 h-6 bg-[var(--primary)]/30 rounded" />
            </div>
            <div className="w-16 h-4 bg-[var(--border)]/50 rounded" />
          </div>
          <div className="space-y-3">
            <div className="w-24 h-8 bg-[var(--border)]/50 rounded" />
            <div className="w-32 h-4 bg-[var(--border)]/30 rounded" />
          </div>
        </div>
      ))}
    </>
  );
}

interface SkeletonStatsProps {
  className?: string;
  count?: number;
}

/**
 * SkeletonStats Component
 * 
 * A specialized skeleton for stats cards (like in dashboard).
 */
export function SkeletonStats({ className = "", count = 4 }: SkeletonStatsProps) {
  return <SkeletonCard className={className} count={count} />;
}
