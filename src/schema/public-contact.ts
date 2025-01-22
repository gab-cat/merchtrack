import { z } from "zod";

export const formContactSchema = z.object({
  email: z.string().email("Invalid email format").nonempty("Email is required"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

export type FormContactType = z.infer<typeof formContactSchema>