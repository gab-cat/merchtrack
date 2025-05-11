import { z } from "zod";

export const ticketSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  createdById: z.string(),
  assignedToId: z.string().optional(),
});

export const ticketUpdateSchema = z.object({
  ticketId: z.string(),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
  message: z.string().min(5, "Message must be at least 5 characters long"),
  assignedToId: z.string().optional(),
  createdBy: z.string().optional(),
});

export type TicketUpdate = {
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  message: string;
  createdBy: string;
  createdAt: string;
};

export type CreateTicketInput = z.infer<typeof ticketSchema>;
export type UpdateTicketInput = {
  ticketId: string;
  status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  assignedToId?: string;
  updates?: string;
};
export type AddTicketUpdateInput = z.infer<typeof ticketUpdateSchema>; 