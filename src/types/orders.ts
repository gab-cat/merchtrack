import { Order, OrderItem, Payment } from "@prisma/client";
import type { Product, ProductVariant, User } from "@prisma/client";

export type ExtendedOrder = Order & {
  customer: User;
  payments: Payment[];
  orderItems: (OrderItem & {
    variant: ProductVariant & {
      product: Product;
    };
  })[];
};

export type ExtendedOrderItem = OrderItem & {
  variant: ProductVariant & {
    product: Product;
  };
};

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  READY = "READY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED"
}

export enum OrderPaymentStatus {
  PENDING = "PENDING",
  DOWNPAYMENT = "DOWNPAYMENT",
  PAID = "PAID",
  REFUNDED = "REFUNDED"
}

export enum PaymentMethod {
  CASH = "CASH",
  GCASH = "GCASH",
  MAYA = "MAYA",
  BANK_TRANSFER = "BANK_TRANSFER"
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED"
}

