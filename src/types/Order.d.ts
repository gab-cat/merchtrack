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
  cancellationReason?: CancellationReason | null
  totalAmount: number
  discountAmount: number
  estimatedDelivery: Date
  createdAt: Date
  updatedAt: Date
  fulfillmentId?: string | null
  customerSatisfactionSurveyId?: string | null
}

export enum CancellationReason {
  OUT_OF_STOCK = "OUT_OF_STOCK",
  CUSTOMER_REQUEST = "CUSTOMER_REQUEST",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  OTHER = "OTHER"
}