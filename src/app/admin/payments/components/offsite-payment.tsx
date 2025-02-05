"use client";

import type { OffsitePaymentRequest } from "@/types/payments";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OffsitePaymentProps {
  payments: OffsitePaymentRequest[];
  onConfirm: (payment: OffsitePaymentRequest) => void;
  onReject: (payment: OffsitePaymentRequest) => void;
}

export function OffsitePayment({ payments, onConfirm, onReject }: OffsitePaymentProps) {
  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold">OFFSITE PAYMENT</h2>
      {payments.length > 0 ? (
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {payments.map((payment) => (
              <div
                key={payment.orderId}
                className="flex items-center justify-between border-b border-gray-300 py-2"
              >
                <div>
                  <div className="text-sm">{payment.orderNo}</div>
                  <div className="text-xs text-gray-500">{payment.customerName}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onConfirm(payment)}
                    className="bg-blue-600 px-4 text-xs text-white hover:bg-blue-700"
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onReject(payment)}
                    className="bg-red-500 px-4 text-xs text-white hover:bg-red-600"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
          No offsite confirmation requests at the moment
        </div>
      )}
    </div>
  );
}
