import { FC } from "react";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { ExtendedOrderItem } from "@/types/orders";

interface OrderItemsTableProps {
  items?: ExtendedOrderItem[];
}

export const OrderItemsTable: FC<OrderItemsTableProps> = ({ items = [] }) => {
  if (!items?.length) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground">No items found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[100px]">Image</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="relative size-16 overflow-hidden rounded-lg border bg-white shadow-sm">
                  <Image
                    src={item.variant.product.imageUrl?.[0] ?? '/img/profile-placeholder-img.png'}
                    alt={item.variant.product.title ?? 'Product image'}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="line-clamp-1 font-medium">{item.variant.product.title ?? 'Unknown Product'}</p>
                  <p className="text-muted-foreground line-clamp-1 text-sm">{item.variant.variantName ?? 'Unknown Variant'}</p>
                </div>
              </TableCell>
              <TableCell>
                {item.customerNote ? (
                  <Badge variant="outline" className="w-10 justify-center">
                    {item.customerNote}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="w-12 justify-center">
                  ×{item.quantity}
                </Badge>
              </TableCell>
              <TableCell className="tabular-nums">
                {formatCurrency(Number(item.price))}
              </TableCell>
              <TableCell className="font-medium tabular-nums">
                {formatCurrency(Number(item.price) * item.quantity)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};