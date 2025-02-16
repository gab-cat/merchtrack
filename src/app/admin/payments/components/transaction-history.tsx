"use client";

import * as React from "react";
import { PaymentStatus, Payment } from "@prisma/client";
import { format } from "date-fns";
import { FaCheck, FaRegClock, FaTimes, FaMoneyBill, FaMoneyBillWave } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface TransactionHistoryProps {
  payments?: Payment[];
  isLoading: boolean;
}

export function TransactionHistory({ payments, isLoading }: TransactionHistoryProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <FaRegClock className="mr-2 size-5 animate-spin text-primary" />
        <span className="text-gray-500">Loading transactions...</span>
      </div>
    );
  }

  if (!payments?.length) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <FaMoneyBillWave className="mb-2 size-8 text-gray-400" />
        <span className="ml-2 text-gray-500">No transactions found</span>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-3">
        {payments.map((payment) => (
          <div 
            key={payment.id} 
            className="flex items-center gap-4 rounded-lg border bg-white p-4 transition-colors hover:border-primary hover:bg-primary/5"
          >
            <div className={cn(
              "flex size-10 items-center justify-center rounded-full",
              payment.paymentStatus === PaymentStatus.VERIFIED && "bg-green-100",
              payment.paymentStatus === PaymentStatus.PENDING && "bg-yellow-100",
              payment.paymentStatus === PaymentStatus.REFUNDED && "bg-red-100",
            )}>
              {payment.paymentStatus === PaymentStatus.VERIFIED && (
                <FaCheck className="size-5 text-green-600" />
              )}
              {payment.paymentStatus === PaymentStatus.PENDING && (
                <FaRegClock className="size-5 text-yellow-600" />
              )}
              {payment.paymentStatus === PaymentStatus.REFUNDED && (
                <FaTimes className="size-5 text-red-600" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Payment for Order #{payment.orderId}</p>
                  <FaMoneyBill className="size-4 text-primary" />
                </div>
                <p className="font-medium text-gray-900">
                  ₱{Number(payment.amount).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-neutral-2">
                  <Badge>{payment.paymentMethod}</Badge>
                  <span className="text-neutral-7">•</span>
                  <Badge variant='outline' className="text-neutral-7">{payment.paymentSite}</Badge>
                  {payment.referenceNo && (
                    <>
                      <span>•</span>
                      <span>Ref: {payment.referenceNo}</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {format(new Date(payment.createdAt), "MMM d, yyyy h:mm a")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

