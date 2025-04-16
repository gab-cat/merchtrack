import { z } from 'zod';
import { Role } from '@prisma/client';

const rolePricingSchema = z.object({
  [Role.PLAYER]: z.number().min(0),
  [Role.STUDENT]: z.number().min(0),
  [Role.STAFF_FACULTY]: z.number().min(0),
  [Role.ALUMNI]: z.number().min(0),
  [Role.OTHERS]: z.number().min(0)
});

export const variantSchema = z.object({
  id: z.string().optional(), // Make ID optional for new variants
  variantName: z.string().min(1, "Variant name is required"),
  price: z.number().min(0, "Price must be positive"),
  inventory: z.number().min(0, "Inventory must be 0 or greater"),
  rolePricing: z.object({
    PLAYER: z.number().min(0).optional(),
    STUDENT: z.number().min(0).optional(),
    STAFF_FACULTY: z.number().min(0).optional(),
    ALUMNI: z.number().min(0).optional(),
    OTHERS: z.number().min(0),
  })
}).strict(); // Ensure no extra fields are passed

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
  isDeleted: z.boolean().default(false),
  variants: z.array(variantSchema).min(1, "At least one variant is required")
});

export type CreateProductType = z.infer<typeof createProductSchema> & {
  _tempFiles?: File[];
};


