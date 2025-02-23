import { Product, Category, Review, ProductVariant, User } from "@prisma/client";

export interface ExtendedProductVariant extends ProductVariant {
  rolePricing: Record<string, number>;
}

export type ExtendedProduct = Product & {
  category: Category;
  reviews: Review[];
  variants: ExtendedProductVariant[];
  postedBy: User;
}

export type GetObjectByTParams<T extends string> = {
  userId: string;
  limitFields?: string[];
} & {
  [K in T]: string;
};