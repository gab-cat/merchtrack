import { z } from 'zod';
import { Role } from '@prisma/client';

const rolePricingSchema = z.object({
  [Role.PLAYER]: z.number().min(0),
  [Role.STUDENT]: z.number().min(0),
  [Role.STAFF_FACULTY]: z.number().min(0),
  [Role.ALUMNI]: z.number().min(0),
  [Role.OTHERS]: z.number().min(0)
});

export const createProductSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  tags: z.array(z.string()).max(10, "Maximum of 10 tags allowed").optional(),
  discountLabel: z.string().optional(),
  supposedPrice: rolePricingSchema.optional(),
  imageUrl: z.array(z.string()).min(1, "At least one image is required"),
  isBestPrice: z.boolean().default(false),
  inventory: z.number().min(0, "Inventory cannot be negative"),
  inventoryType: z.enum(["PREORDER", "STOCK"]).default("PREORDER"),
  categoryId: z.string({
    required_error: "Category is required"
  }),
  variants: z.array(z.object({
    variantName: z.string().min(1, "Variant name is required"),
    price: z.number().min(0, "Price cannot be negative"),
    rolePricing: rolePricingSchema
  })).min(1, "At least one variant is required")
});

export type CreateProductType = z.infer<typeof createProductSchema> & {
  _tempFiles?: File[];
};


