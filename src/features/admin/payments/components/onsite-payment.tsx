'use client';

import { useState } from "react";
import { FaSearch, FaBox } from "react-icons/fa";
import { orders, type Order } from "@/types/Misc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OnsitePaymentProps {
  onPaymentComplete: (orderId: string, amount: number) => void
}

export function OnsitePayment({ onPaymentComplete }: Readonly<OnsitePaymentProps>) {
  const [orderId, setOrderId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [amount, setAmount] = useState("");
  const [paymentOption, setPaymentOption] = useState("");

  const handleSearch = () => {
    const order = orders.find((o) => o.id.toLowerCase() === orderId.toLowerCase());
    if (order) {
      setSelectedOrder(order);
    } else {
      setSelectedOrder(null);
    }
  };

  const handleConfirm = () => {
    if (selectedOrder && amount && paymentOption) {
      const paymentAmount = Number.parseFloat(amount);
      if (!isNaN(paymentAmount) && paymentAmount > 0 && paymentAmount <= selectedOrder.balance) {
        onPaymentComplete(selectedOrder.id, paymentAmount);
        setAmount("");
        setPaymentOption("");
        selectedOrder.balance = Math.max(selectedOrder.balance - paymentAmount, 0);
      }
    }
  };

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold">ONSITE PAYMENT</h2>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="bg-white"
          />
          <Button onClick={handleSearch} className="bg-blue-600 text-white hover:bg-blue-700">
            <FaSearch className="mr-2" /> Search
          </Button>
        </div>

        {selectedOrder && (
          <div className="space-y-4">
            <div className="text-sm font-medium">Items</div>
            <div className="space-y-2">
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2">
                  <div className="flex size-8 items-center justify-center rounded bg-gray-100">
                    <FaBox className="size-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">{item.itemName}</div>
                    <div className="text-xs text-gray-500">{item.quantity}pcs</div>
                  </div>
                  <div className="text-sm">₱{item.price.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="space-y-1 border-t pt-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₱{(selectedOrder.total - selectedOrder.otherFees).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Other Fees</span>
                <span>₱{selectedOrder.otherFees.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>TOTAL</span>
                <span>₱{selectedOrder.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-red-500">
                <span>Balance</span>
                <span>₱{selectedOrder.balance.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Input
                placeholder="Payment"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={selectedOrder.balance}
                className="bg-white"
              />
              <Select value={paymentOption} onValueChange={setPaymentOption}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Payment Option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onsite">Onsite</SelectItem>
                  <SelectItem value="offsite">Offsite</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleConfirm}
                disabled={!amount || !paymentOption}
                className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
              >
                  Confirm
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

