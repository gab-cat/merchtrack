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

/**
 * Creates a non-negative number, ensuring price values are not negative.
 *
 * @param n - The number to validate as a non-negative value
 * @returns The input number as a NonNegativeNumber type
 * @throws {Error} If the input number is less than zero
 *
 * @remarks
 * This utility function helps enforce type safety for pricing by preventing negative values.
 *
 * @example
 * const price = createNonNegativeNumber(100); // Returns 100
 * const invalidPrice = createNonNegativeNumber(-50); // Throws an error
 */
function createNonNegativeNumber(n: number): NonNegativeNumber {
  if (n < 0) throw new Error('Price cannot be negative');
  return n as NonNegativeNumber;
}