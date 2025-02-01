import { Product, Category, Review, ProductVariant, User } from "@prisma/client";


export type ExtendedProduct = Product & {
  category: Category
  reviews: Review[]
  variants: ProductVariant[]
  postedBy: User
}

export type GetObjectByTParams<T extends string> = {
  userId: string
  limitFields?: string[]
} & {
  [K in T]: string
};