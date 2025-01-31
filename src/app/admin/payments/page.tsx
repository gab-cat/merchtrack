"use client";

import { useState } from "react";
import { OnsitePayment } from "@/components/private/onsite-payment";
import { OffsitePayment } from "@/components/private/offsite-payment";
import { TransactionHistory } from "@/components/private/transaction-history";
import { offsitePayments as initialOffsitePayments, transactions as initialTransactions } from "@/types/payments";
import type { Transaction, OffsitePaymentRequest } from "@/types/payments";

export default function PaymentsPage() {
  const [offsitePayments, setOffsitePayments] = useState(initialOffsitePayments);
  const [transactions, setTransactions] = useState(initialTransactions);

  const handleOnsitePayment = (orderId: string, amount: number) => {
    const order = offsitePayments.find((p) => p.orderId === orderId);
    const newTransaction: Transaction = {
      id: `TRX${transactions.length + 1}`.padStart(6, "0"),
      orderId,
      orderNo: order?.orderNo || `#${orderId}`,
      customerName: order?.customerName || "Customer",
      amount,
      paymentType: "onsite",
      date: new Date().toISOString().split("T")[0],
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const handleOffsiteConfirm = (payment: OffsitePaymentRequest) => {
    setOffsitePayments((prev) => prev.filter((p) => p.orderId !== payment.orderId));

    const newTransaction: Transaction = {
      id: `TRX${transactions.length + 1}`.padStart(6, "0"),
      orderId: payment.orderId,
      orderNo: payment.orderNo,
      customerName: payment.customerName,
      amount: payment.amount,
      paymentType: "offsite",
      date: new Date().toISOString().split("T")[0],
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const handleOffsiteReject = (payment: OffsitePaymentRequest) => {
    setOffsitePayments((prev) => prev.filter((p) => p.orderId !== payment.orderId));
  };

  return (
    <div className="mx-auto max-w-7xl p-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <OnsitePayment onPaymentComplete={handleOnsitePayment} />
        </div>
        <div className="space-y-4">
          <OffsitePayment payments={offsitePayments} onConfirm={handleOffsiteConfirm} onReject={handleOffsiteReject} />
          <TransactionHistory transactions={transactions} />
        </div>
      </div>
    </div>
  );
}

