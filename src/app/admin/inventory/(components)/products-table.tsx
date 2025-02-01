'use client';

import { flexRender, getCoreRowModel, useReactTable, type Row } from "@tanstack/react-table";
import { ProductActions } from "./product-actions";
import { useProductsQuery } from "@/hooks/products.hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExtendedProduct } from "@/types/extended";
import { formatCurrency } from "@/utils/formatCurrency";
import { Badge } from "@/components/ui/badge";
import { PaginatedResponse } from "@/types/common";

const columns = [
  {
    accessorKey: "title",
    header: "Product Name",
  },
  {
    accessorKey: "inventory",
    header: "Stock",
    cell: ({ row }: { row: Row<ExtendedProduct> }) => (
      <Badge variant={row.original.inventory > 0 ? "default" : "destructive"}>
        {row.original.inventory}
      </Badge>
    ),
  },
  {
    accessorKey: "variants",
    header: "Base Price",
    cell: ({ row }: { row: Row<ExtendedProduct> }) => {
      const basePrice = row.original.variants[0]?.price || 0;
      return formatCurrency(basePrice as unknown as number);
    },
  },
  {
    accessorKey: "inventoryType",
    header: "Type",
    cell: ({ row }: { row: Row<ExtendedProduct> }) => (
      <Badge variant="outline">
        {row.original.inventoryType.toLowerCase()}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }: { row: Row<ExtendedProduct> }) => <ProductActions product={row.original} />,
  },
];

export default function ProductsTable() {
  const { data, isLoading } = useProductsQuery({
    limit: 20,
  });
  const products = data ? (data as PaginatedResponse<ExtendedProduct[]>).data : [];

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {columns.map((column, index) => (
              <TableHead key={index}>
                <div className="bg-muted h-4 w-24 animate-pulse rounded" />
              </TableHead>
            ))}
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, index) => (
              <TableRow key={index}>
                {columns.map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <div className="bg-muted h-4 w-full animate-pulse rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No products found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
