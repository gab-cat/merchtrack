import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductRecommendationSkeleton() {
  return (
    <Card className="border-none shadow-none">
      <CardContent className="pt-6">
        <Skeleton className="mb-4 h-8 w-56" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="cursor-pointer">
              <div className="relative mb-2 aspect-square overflow-hidden rounded-md">
                <Skeleton className="size-full" />
              </div>
              <Skeleton className="mb-2 h-5 w-3/4" />
              <div className="mt-1 flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="mr-0.5 size-4" />
                ))}
              </div>
              <Skeleton className="mt-1 h-4 w-1/4" />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <Skeleton className="h-8 w-72" />
        </div>
      </CardContent>
    </Card>
  );
}
