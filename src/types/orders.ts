import { Order, OrderItem, Payment } from "@prisma/client";
import type { CustomerSatisfactionSurvey, Product, ProductVariant, User } from "@prisma/client";

export type ExtendedOrder = Order & {
  customerSatisfactionSurvey: CustomerSatisfactionSurvey;
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
  BANK_TRANSFER = "BANK_TRANSFER",
  OTHERS = "OTHERS"
}

export enum PaymentSitePreference {
  ONSITE = "ONSITE",
  OFFSITE = "OFFSITE"
}

export enum PaymentPreference {
  FULL = "FULL",
  DOWNPAYMENT = "DOWNPAYMENT"
}

export enum CancellationReason {
  OUT_OF_STOCK = "OUT_OF_STOCK",
  CUSTOMER_REQUEST = "CUSTOMER_REQUEST",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  OTHERS = "OTHERS"
}

