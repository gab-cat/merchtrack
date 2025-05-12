import { z } from "zod";

export const checkoutSchema = z.object({
  userId: z.string(),
  items: z.array(
    z.object({
      variantId: z.string(),
      quantity: z.number(),
      price: z.number(),
      note: z.string().max(500).optional(),
    })
  ),
  customerNotes: z
    .string()
    .max(500, "Note cannot exceed 500 characters")
    .optional(),
});
  
export type CheckoutInput = z.infer<typeof checkoutSchema>;