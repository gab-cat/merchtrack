import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export const SurveyCategorySkeleton = memo(() => {
  return Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      <TableCell>
        <Skeleton className="h-4 w-[200px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-[300px]" />
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-[250px]" />
          ))}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Skeleton className="size-8" />
          <Skeleton className="size-8" />
        </div>
      </TableCell>
    </TableRow>
  ));
});

SurveyCategorySkeleton.displayName = "SurveyCategorySkeleton";