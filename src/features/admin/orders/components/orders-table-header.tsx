"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  TableHeader,
  TableRow,
  TableHead as TableHeadCell,
} from "@/components/ui/table";

export function OrdersTableHeader() {
  return (
    <TableHeader>
      <TableRow className="font-bold">
        <TableHeadCell className="w-12">
          <Checkbox className="text-white" />
        </TableHeadCell>
        <TableHeadCell className="font-bold">Order No.</TableHeadCell>
        <TableHeadCell className="font-bold">Date</TableHeadCell>
        <TableHeadCell className="font-bold">Name</TableHeadCell>
        <TableHeadCell className="font-bold">Type</TableHeadCell>
        <TableHeadCell className="font-bold">Payment Status</TableHeadCell>
        <TableHeadCell className="font-bold">Order Status</TableHeadCell>
        <TableHeadCell className="text-right font-bold">Amount</TableHeadCell>
      </TableRow>
    </TableHeader>
  );
}