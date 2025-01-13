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
  student: NonNegativeNumber;
  studentNonCocs: NonNegativeNumber;
  faculty: NonNegativeNumber;
  alumni: NonNegativeNumber;
  others: NonNegativeNumber;
}

type NonNegativeNumber = number & { __brand: 'NonNegativeNumber' };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createNonNegativeNumber(n: number): NonNegativeNumber {
  if (n < 0) throw new Error('Price cannot be negative');
  return n as NonNegativeNumber;
}