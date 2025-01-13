export type OrderItem = {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  customerNote?: string | null
  size?: string | null
  createdAt: Date
  updatedAt: Date
}