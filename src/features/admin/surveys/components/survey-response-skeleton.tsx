import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export const SurveyResponseSkeleton = memo(() => {
  return Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      <TableCell>
        <Skeleton className="h-8 w-[120px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-[150px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-[180px]" />
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-[30px]" />
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="size-4 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-[200px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-[100px]" />
      </TableCell>
    </TableRow>
  ));
});

SurveyResponseSkeleton.displayName = "SurveyResponseSkeleton";