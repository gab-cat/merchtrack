import { z } from "zod";

export const replyMessageSchema = z.object({
  reply: z.string().min(1, {
    message: 'Reply must be at least 1 character long'
  }).max(500, {
    message: 'Reply must be at most 500 characters long'
  })
});

export type ReplyMessageType = z.infer<typeof replyMessageSchema>;

export const createMessageSchema = z.object({
  emails: z.array(z.string().email({
    message: 'Please enter a valid email address'
  })).min(1, {
    message: 'At least one email recipient is required'
  }),
  subject: z.string().min(1, {
    message: 'Subject must be at least 1 character long'
  }).max(100, {
    message: 'Subject must be at most 100 characters long'
  }),
  message: z.string().min(1, {
    message: 'Message must be at least 1 character long'
  }).max(500, {
    message: 'Message must be at most 500 characters long'
  }),
  customerName: z.string().min(1, { message: 'Customer name must be at least 1 character long' }),
});

export type CreateMessageType = z.infer<typeof createMessageSchema>;