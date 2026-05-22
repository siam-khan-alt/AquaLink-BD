import Card from "@/components/ui/Card";
import { Skeleton } from "@heroui/react";

export default function FarmerPondsLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 space-y-3">
              <Skeleton className="h-5 w-32 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-3 w-40 rounded-lg" />
            </Card>
          ))}
        </div>

        {/* Ponds Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-6 space-y-4">
              <Skeleton className="h-6 w-40 rounded-lg" />
              <Skeleton className="h-4 w-32 rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20 rounded-lg" />
                  <Skeleton className="h-4 w-16 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20 rounded-lg" />
                  <Skeleton className="h-4 w-16 rounded-lg" />
                </div>
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}
