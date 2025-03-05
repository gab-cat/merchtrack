import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductReviewsSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="border-b pb-4 last:border-b-0">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <Skeleton className="mr-3 h-5 w-24" />
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="mr-0.5 h-4 w-4" />
                ))}
              </div>
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}
