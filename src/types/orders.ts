import { Order, Payment, User } from "@prisma/client";

export type ExtendedOrder = Order & {
  customer: User
  payments: Payment[]
};