import { Order, OrderItem, Payment, Product, ProductVariant, User } from "@prisma/client";

export type ExtendedOrder = Order & {
  customer: User
  payments: Payment[]
  orderItems: ExtendedOrderItem[]
};

export interface ExtendedOrderItem extends OrderItem {
  variant: ExtendedProductVariant
}

export type ExtendedProductVariant = ProductVariant & {
  product: Product
};

