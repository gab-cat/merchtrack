import { Payment, PaymentMethod, PaymentStatus } from '@prisma/client';

export interface PaymentWhereInput {
  id?: string;
  userId?: string;
  orderId?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  isDeleted?: boolean;
}

export interface PaymentOrderByInput {
  createdAt?: 'asc' | 'desc';
  updatedAt?: 'asc' | 'desc';
  amount?: 'asc' | 'desc';
}

export interface PaymentResponse {
  success: boolean;
  data?: Payment;
  error?: string;
}