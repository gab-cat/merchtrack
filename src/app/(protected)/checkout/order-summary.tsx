'use client';

import Image from 'next/image';
import { ShoppingBag, PackageCheck, Receipt } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { formatCurrency } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export function OrderSummary() {
  const { cartItems } = useCartStore();

  const selectedItems = cartItems.filter(item => item.selected);
  const subtotal = selectedItems.reduce(
    (total, item) => total + Number(item.variant.price) * item.quantity,
    0
  );

  // In a real app, these would be calculated based on business logic
  const shipping = 0;
  const tax = 0;
  const total = subtotal + shipping + tax;

  if (selectedItems.length === 0) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="size-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-center">
          No items selected for checkout
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Receipt className="size-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 bg-white">
        <ScrollArea className="h-[40vh] rounded-md border p-4">
          <div className="space-y-4">
            {selectedItems.map((item) => (
              <div key={item.variantId} className="flex space-x-4">
                <div className="relative size-16 overflow-hidden rounded-md border bg-neutral-50">
                  {item.variant.product?.imageUrl && (
                    <Image
                      src={item.variant.product.imageUrl[0]}
                      alt={item.variant.product.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="font-medium text-primary">
                    {item.variant.product?.title}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {item.variant.variantName}
                  </span>
                  <div className="mt-auto flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1 text-sm">
                      <ShoppingBag className="size-4" />
                      Qty: {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(Number(item.variant.price) * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="rounded-lg border bg-neutral-50/50 p-4">
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1 text-sm">
                <PackageCheck className="size-4" />
                Shipping
              </span>
              <span>{formatCurrency(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Tax</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span className="text-lg text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}