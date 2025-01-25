"use client";

import { useState } from "react";
import { PaymentForm } from "@/components/private/payment-form";
import { OrderSearch } from "@/components/private/order-search";
import { type Order } from "@/types/Misc";

export default function PaymentsPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [balance, setBalance] = useState(0);

  // Handle order selection
  const handleOrderSelect = (order: Order | null) => {
    setSelectedOrder(order);
    if (order) {
      setBalance(order.balance);
    }
  };

  // Handle balance update
  const handleBalanceUpdate = (newBalance: number) => {
    setBalance(newBalance);
  };

  // Handle payment submission
  const handlePaymentSubmit = (amount: number) => {
    if (selectedOrder) {
      const newBalance = Math.max(balance - amount, 0);
      setBalance(newBalance);
      selectedOrder.balance = newBalance;
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Payments</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <OrderSearch onOrderSelect={handleOrderSelect} onBalanceUpdate={handleBalanceUpdate} />
        <PaymentForm selectedOrder={selectedOrder} onPaymentSubmit={handlePaymentSubmit} />
      </div>
    </div>
  );
}

