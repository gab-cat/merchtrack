"use client";

import { useState } from "react";
import { FaSearch, FaBox } from "react-icons/fa";
import { orders, type Order } from "@/types/Misc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface OrderSearchProps {
  onOrderSelect: (order: Order | null) => void
  onBalanceUpdate: (newBalance: number) => void
}

export function OrderSearch({ onOrderSelect, onBalanceUpdate }: OrderSearchProps) {
  const [orderId, setOrderId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleSearch = () => {
    const order = orders.find((o) => o.id.toLowerCase() === orderId.toLowerCase());
    if (order) {
      setSelectedOrder(order);
      onOrderSelect(order);
      onBalanceUpdate(order.balance);
    } else {
      setSelectedOrder(null);
      onOrderSelect(null);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Order Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
            <Button onClick={handleSearch}>
              <FaSearch className="mr-2" /> Search
            </Button>
          </div>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="text-lg font-semibold">Items</div>
              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded border p-2">
                    <div className="bg-muted flex size-10 items-center justify-center rounded">
                      <FaBox className="size-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.itemName}</div>
                      <div className="text-muted-foreground text-sm">{item.quantity}pcs</div>
                    </div>
                    <div className="font-medium">₱{item.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₱{(selectedOrder.total - selectedOrder.otherFees).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other Fees</span>
                  <span>₱{selectedOrder.otherFees.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>TOTAL</span>
                  <span>₱{selectedOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-red-500">
                  <span>Balance</span>
                  <span>₱{selectedOrder.balance.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

