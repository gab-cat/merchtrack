import { PaymentMethod, PaymentSite, PaymentStatus } from "@prisma/client";

export type ProcessPaymentInput = {
  userId: string;
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentSite: PaymentSite;
  paymentStatus: PaymentStatus;
  referenceNo?: string;
  memo?: string;
  transactionId?: string;
  paymentProvider?: string;
  limitFields?: string[];
};

export type RefundPaymentInput = {
  userId: string;
  paymentId: string;
  amount: number;
  reason: string;
};

export type ValidatePaymentInput = {
  userId: string;
  orderId: string;
  amount: number;
  transactionDetails: {
    transactionId: string;
    referenceNo: string;
    paymentMethod: PaymentMethod;
    paymentSite: PaymentSite;
  };
  paymentId: string;
};

export type RejectPaymentInput = {
  userId: string;
  orderId: string;
  paymentId: string;
  rejectionReason: string;
}; 