export enum Condition {
  NEW = "NEW",
  USED = "USED"
}

export enum Delivery {
  STANDARD = "STANDARD",
  EXPRESS = "EXPRESS"
}

export enum InventoryType {
  PREORDER = "PREORDER",
  STOCK = "STOCK"
}

export type Product = {
  id: string
  categoryId?: string | null
  postedById: string
  slug: string
  title: string
  description?: string | null
  discountedPrice: Price
  originalPrice: Price
  discountLabel?: string | null
  rating: number
  reviewsCount: number
  imageUrl: string
  imageUrlDark?: string | null
  isBestPrice: boolean
  inventory: number
  inventoryType: InventoryType
  createdAt: Date
  updatedAt: Date
  condition: Condition
  deliveryType: Delivery
}

type Price = {
  student: number
  studentNonCocs: number
  faculty: number
  alumni: number
  others: number
}