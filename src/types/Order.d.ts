export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED"
}

export type Order = {
  id: string
  customerId: string
  processedById?: string | null
  orderDate: Date
  status: OrderStatus
  totalAmount: number
  discountAmount: number
  estimatedDelivery: Date
  createdAt: Date
  updatedAt: Date
  fulfillmentid?: string | null
  customerSatisfactionSurveyid?: string | null
}