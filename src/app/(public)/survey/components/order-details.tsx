'use client';

import { FiShoppingBag } from "react-icons/fi";
import Image from "next/image";
import { motion } from "framer-motion";
import { container } from "./animation-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExtendedOrder } from "@/types/orders";

interface OrderDetailsProps {
  order: ExtendedOrder;
}

export function OrderDetails({ order }: Readonly<OrderDetailsProps>) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="order-2 lg:order-1"
    >
      <Card className="border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold text-primary">
            <FiShoppingBag className="size-5" />
            Order Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Order ID</p>
                <p className="font-semibold">#{order.id}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-sm">Order Date</p>
                <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Customer</p>
              <p className="font-semibold">{order.customer.firstName} {order.customer.lastName}</p>
              <p className="text-muted-foreground text-sm">{order.customer.email}</p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Order Items</h3>
            <div className="space-y-3">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-md border">
                    <Image
                      src={item.variant.product.imageUrl[0] || '/img/profile-placeholder-img.png'}
                      alt={item.variant.product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{item.variant.product.title}</p>
                    <Badge variant="secondary" className="text-xs">
                      {item.variant.variantName}
                    </Badge>
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-sm">
                        Qty: {item.quantity}
                      </p>
                      <p className="font-medium">
                        ₱{(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₱{(Number(order.totalAmount) + Number(order.discountAmount)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-muted-foreground">- ₱{Number(order.discountAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total</span>
                <span className="font-medium text-primary">₱{Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}