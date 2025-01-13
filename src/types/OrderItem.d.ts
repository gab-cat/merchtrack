export type OrderItem = {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  customerNote?: string | null
  size?: ProductSize | null
  createdAt: Date
  updatedAt: Date
}

export enum ProductSize {
  XS = "XS",
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  XXL = "XXL"
}