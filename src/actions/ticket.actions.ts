"use server";

import { z } from "zod";
import prisma from "@/lib/db";
import { invalidateCache } from "@/lib/redis";
import { ExtendedTicket } from "@/types/tickets";
import { processActionReturnData, verifyPermission } from "@/utils";
import { PaginatedResponse, QueryParams } from "@/types/common";
import { GetObjectByTParams } from "@/types/extended";

const ticketSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  createdById: z.string(),
  assignedToId: z.string().optional(),
});

const ticketUpdateSchema = z.object({
  ticketId: z.string(),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
  message: z.string().min(5, "Message must be at least 5 characters long"),
  assignedToId: z.string().optional(),
  createdBy: z.string().optional(),
});

type CreateTicketInput = z.infer<typeof ticketSchema>;
type UpdateTicketInput = {
  ticketId: string;
  status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  assignedToId?: string;
  updates?: string;
};
type AddTicketUpdateInput = z.infer<typeof ticketUpdateSchema>;

/**
 * Creates a new support ticket in the system
 * 
 * @param data - The ticket data to be created
 * @returns An object with success status, message, and created ticket data
 */
export async function createTicket(data: CreateTicketInput): Promise<ActionsReturnType<ExtendedTicket>> {
  try {
    const validationResult = ticketSchema.safeParse(data);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc: Record<string, string>, error) => {
        acc[error.path[0]] = error.message;
        return acc;
      }, {});

      return {
        success: false,
        message: "Validation failed",
        errors,
      };
    }

    const ticket = await prisma.ticket.create({
      data: validationResult.data,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            college: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            college: true,
          },
        },
      }
    });

    return {
      success: true,
      message: "Ticket created successfully",
      data: processActionReturnData(ticket) as ExtendedTicket,
    };
  } catch (error) {
    console.error("Error creating ticket:", error);
    return {
      success: false,
      message: "Failed to create ticket",
      errors: { general: "An error occurred while creating the ticket" },
    };
  }
}

/**
 * Updates an existing ticket's status, priority, or assignment
 * 
 * @param data - The ticket update data
 * @returns An object with success status, message, and updated ticket data
 */
export async function updateTicket(data: UpdateTicketInput): Promise<ActionsReturnType<ExtendedTicket>> {
  try {
    const { ticketId, ...updateData } = data;
    
    // Ensure we have a valid ticket ID
    if (!ticketId) {
      return {
        success: false,
        message: "Ticket ID is required",
        errors: { ticketId: "Ticket ID is required" },
      };
    }

    // Only include fields that are provided in the update
    const updateFields: TicketUpdate = {};
    if (updateData.status) updateFields.status = updateData.status;
    if (updateData.priority) updateFields.priority = updateData.priority;
    if (updateData.assignedToId) updateFields.assignedToId = updateData.assignedToId;

    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: updateFields,
    });

    await invalidateCache(['tickets:all', `ticket:${ticketId}`]);

    return {
      success: true,
      message: "Ticket updated successfully",
      data: processActionReturnData(ticket) as ExtendedTicket,
    };
  } catch (error) {
    console.error("Error updating ticket:", error);
    return {
      success: false,
      message: "Failed to update ticket",
      errors: { general: "An error occurred while updating the ticket" },
    };
  }
}

/**
 * Adds an update to a ticket's history and optionally changes its status or assignment
 * 
 * @param data - The ticket update data including message and status changes
 * @returns An object with success status, message, and updated ticket data
 */
export async function addTicketUpdate(data: AddTicketUpdateInput): Promise<ActionsReturnType<ExtendedTicket>> {
  try {
    const validationResult = ticketUpdateSchema.safeParse(data);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc: Record<string, string>, error) => {
        acc[error.path[0]] = error.message;
        return acc;
      }, {});

      return {
        success: false,
        message: "Validation failed",
        errors,
      };
    }

    const { ticketId, status, message, assignedToId, createdBy } = validationResult.data;

    // Get current ticket to access its updates
    const currentTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        createdBy: true,
        assignedTo: true,
      },
    });

    if (!currentTicket) {
      return {
        success: false,
        message: "Ticket not found",
        errors: { ticketId: "Ticket with the provided ID does not exist" },
      };
    }

    // Parse current updates and add new update
    let updates: TicketUpdate[] = [];
    try {
      updates = JSON.parse(currentTicket.updates as string) as TicketUpdate[];
    } catch {
      updates = [];
    }

    const newUpdate: TicketUpdate = {
      status,
      message,
      createdBy: createdBy ?? currentTicket.createdById,
      createdAt: new Date().toISOString(),
    };

    updates.push(newUpdate);

    // Update the ticket
    const updateData: Partial<UpdateTicketInput> = {
      updates: JSON.stringify(updates),
      status,
    };

    if (assignedToId) {
      updateData.assignedToId = assignedToId;
    }

    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
    });

    // await invalidateCache(['tickets:all', `ticket:${ticketId}`]);

    return {
      success: true,
      message: "Ticket update added successfully",
      data: processActionReturnData(ticket) as ExtendedTicket,
    };
  } catch (error) {
    console.error("Error adding ticket update:", error);
    return {
      success: false,
      message: "Failed to add ticket update",
      errors: { general: "An error occurred while updating the ticket" },
    };
  }
}

type GetTicketsParams = {
    userId: string
    params: QueryParams
}
export async function getTickets({userId, params = {}}: GetTicketsParams): Promise<ActionsReturnType<PaginatedResponse<ExtendedTicket[]>>> {
  const isAuthorized = await verifyPermission({
    userId: userId,
    permissions: {
      dashboard: { canRead: true },
    }
  });

  try {
    const tickets = await prisma.ticket.findMany({
      where: isAuthorized ? { ...params.where } : { createdById: userId },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            college: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            college: true,
          },
        },
      },
      orderBy: params.orderBy,
      skip: params.skip,
      take: params.take,
    });

    const total = tickets.length;
    const lastPage = Math.ceil(total / (params.take ?? 1));

    return {
      success: true,
      message: "Tickets fetched successfully",
      data: {
        data: processActionReturnData(tickets, params.limitFields) as ExtendedTicket[],
        metadata: {
          page: params.page ?? 1,
          total: total,
          lastPage: lastPage,
          hasNextPage: (params.page ?? 1) < lastPage,
          hasPrevPage: (params.page ?? 1) > 1,
        }
      },
    };
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return {
      success: false,
      message: "Failed to fetch tickets",
      errors: { general: "An error occurred while fetching tickets" },
    };
  }
}

export async function getTicketById({ userId, ticketId, limitFields }: GetObjectByTParams<'ticketId'>): Promise<ActionsReturnType<ExtendedTicket>> {
  const isAuthorized = await verifyPermission({
    userId: userId,
    permissions: {
      dashboard: { canRead: true },
    }
  });
  
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            college: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            college: true,
          },
        },
      },
    });

    const isAssigneeOrIsCreator = ticket?.createdById === userId || ticket?.assignedToId === userId;

    if (!isAuthorized && !isAssigneeOrIsCreator) {
      return {
        success: false,
        message: "Unauthorized",
        errors: { general: "You are not authorized to view this ticket" },
      };
    }

    return {
      success: true,
      message: "Ticket fetched successfully",
      data: processActionReturnData(ticket, limitFields) as ExtendedTicket,
    };
  } catch (error) {
    console.error("Error fetching ticket by ID:", error);
    return {
      success: false,
      message: "Failed to fetch ticket",
      errors: { general: "An error occurred while fetching the ticket" },
    };
  }
}