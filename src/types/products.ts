import { ProductSize } from "@prisma/client";

export type ExtendedProductVariant = {
  id: string;
  productId: string;
  variantName: string;
  price: number;
  rolePricing: PriceMap;
  createdAt: Date;
  updatedAt: Date;
  attributes?: {
    size?: ProductSize;
  };
};

export type ExtendedProduct = {
  id: string;
  isDeleted: boolean;
  categoryId: string | null;
  postedById: string;
  slug: string;
  title: string;
  description: string | null;
  discountLabel: string | null;
  supposedPrice?: PriceMap;
  rating: number;
  reviewsCount: number;
  imageUrl: string[];
  tags: string[];
  isBestPrice: boolean;
  inventory: number;
  inventoryType: "PREORDER" | "STOCK";
  createdAt: Date;
  updatedAt: Date;
  variants: ExtendedProductVariant[];
};