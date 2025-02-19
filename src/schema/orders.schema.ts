import { z } from "zod";
import { ProductSize } from "@prisma/client";

// Enums matching Prisma schema
export const OrderStatus = z.enum([
  "PENDING",
  "PROCESSING",
  "READY",
  "DELIVERED",
  "CANCELLED",
]);

export const OrderPaymentStatus = z.enum([
  "PENDING",
  "DOWNPAYMENT",
  "PAID",
  "REFUNDED",
]);

export const CancellationReason = z.enum([
  "OUT_OF_STOCK",
  "CUSTOMER_REQUEST",
  "PAYMENT_FAILED",
  "OTHERS",
]);

// Schema for order items
export const orderItemSchema = z.object({
  variantId: z.string({
    required_error: "Product variant is required",
    invalid_type_error: "Invalid variant ID format",
  }),
  quantity: z.number({
    required_error: "Quantity is required",
  })
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0")
    .max(100, "Maximum quantity per item is 100"),
  customerNote: z.string().max(500, "Note cannot exceed 500 characters").optional(),
  size: z.nativeEnum(ProductSize).optional(),
  price: z.number({
    required_error: "Price is required",
    invalid_type_error: "Price must be a number",
  })
    .nonnegative("Price cannot be negative"),
  originalPrice: z.number({
    required_error: "Original price is required",
    invalid_type_error: "Original price must be a number",
  })
    .nonnegative("Original price cannot be negative"),
  appliedRole: z.string({
    required_error: "Applied role is required",
  }),
});

// Schema for creating orders
export const createOrderSchema = z.object({
  customerId: z.string({
    required_error: "Customer ID is required",
    invalid_type_error: "Invalid customer ID format",
  }),
  orderItems: z.array(orderItemSchema)
    .min(1, "Order must contain at least one item")
    .max(50, "Order cannot contain more than 50 items"),
  totalAmount: z.number({
    required_error: "Total amount is required",
    invalid_type_error: "Total amount must be a number",
  })
    .nonnegative("Total amount cannot be negative")
    .max(1000000, "Total amount exceeds maximum limit"),
  discountAmount: z.number({
    invalid_type_error: "Discount amount must be a number",
  })
    .nonnegative("Discount amount cannot be negative")
    .max(1000000, "Discount cannot exceed total amount")
    .default(0),
  estimatedDelivery: z.date({
    required_error: "Estimated delivery date is required",
    invalid_type_error: "Invalid date format",
  })
    .min(new Date(), "Estimated delivery date must be in the future"),
  processedById: z.string().optional(),
});

// Schema for updating orders
export const updateOrderSchema = z.object({
  status: OrderStatus.optional(),
  paymentStatus: OrderPaymentStatus.optional(),
  cancellationReason: CancellationReason.optional(),
  estimatedDelivery: z.date({
    invalid_type_error: "Invalid date format",
  })
    .min(new Date(), "Estimated delivery date must be in the future")
    .optional(),
  processedById: z.string().optional(),
});

// Export types
export type CreateOrderType = z.infer<typeof createOrderSchema>;
export type UpdateOrderType = z.infer<typeof updateOrderSchema>;
export type OrderItemType = z.infer<typeof orderItemSchema>;