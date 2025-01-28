import { z } from "zod";

export const replyMessageSchema = z.object({
  reply: z.string().min(1, {
    message: 'Reply must be at least 1 character long'
  }).max(500, {
    message: 'Reply must be at most 500 characters long'
  })
});

export type ReplyMessageType = z.infer<typeof replyMessageSchema>;