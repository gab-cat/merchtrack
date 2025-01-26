import * as React from "react";
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";

export function OrdersTableSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, index) => (
        <TableRow key={`skeleton-row-${index}`}>
          <TableCell>
            <div className="size-4 animate-pulse rounded bg-gray-200"></div>
          </TableCell>
          <TableCell>
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
          </TableCell>
          <TableCell>
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
          </TableCell>
          <TableCell>
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
          </TableCell>
          <TableCell>
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
          </TableCell>
          <TableCell>
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
          </TableCell>
          <TableCell>
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
          </TableCell>
          <TableCell>
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
