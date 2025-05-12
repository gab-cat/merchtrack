import { z } from "zod";

export const createNewCategorySchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  description: z.string().max(200, { message: 'Description must not exceed 200 characters' }).optional()
});

export type CreateNewCategoryType = z.infer<typeof createNewCategorySchema>;