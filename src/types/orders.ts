import { CustomerSatisfactionSurvey, Fulfillment, Order, OrderItem, Payment, User } from "@prisma/client";

export type ExtendedOrder = Order & {
  customer: User
  payments: Payment[] | null
  orderItems: OrderItem[]
  processedBy: User | null
  customerSatisfactionSurvey: CustomerSatisfactionSurvey | null
  fulfillment: Fulfillment | null
};