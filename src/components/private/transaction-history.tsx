"use client";

import type { Transaction } from "@/types/payments";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TransactionHistoryProps {
  transactions: Transaction[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold">TRANSACTION HISTORY</h2>
      <ScrollArea className="h-[200px] pr-4">
        <div className="space-y-2">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between border-b border-gray-300 py-2">
              <div>
                <div className="text-sm">{transaction.orderNo}</div>
                <div className="text-xs text-gray-500">{transaction.customerName}</div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    transaction.paymentType === "onsite" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {transaction.paymentType === "onsite" ? "Onsite" : "Offsite"}
                </span>
                <div className="text-sm">₱{transaction.amount.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

