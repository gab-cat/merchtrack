import { z } from "zod";

export const createNewCategorySchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' })
});

export type CreateNewCategoryType = z.infer<typeof createNewCategorySchema>;