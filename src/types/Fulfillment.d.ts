export enum FulfillmentStatus {
  PENDING = "PENDING",
  PRODUCTION = "PRODUCTION",
  READY = "READY",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export type Fulfillment = {
  id: string
  orderId: string
  fulfillmentDate: Date
  processedById?: string | null
  status: FulfillmentStatus
  createdAt: Date
  updatedAt: Date
}