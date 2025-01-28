import * as React from "react";
import { nanoid } from 'nanoid';
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";

export function OrdersTableSkeleton() {
  return (
    Array.from({ length: 10 }).map(() => (
      <TableRow key={nanoid()}>
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
    ))
  );
}
