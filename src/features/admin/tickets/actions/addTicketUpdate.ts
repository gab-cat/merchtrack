"use server";

import { auth } from "@clerk/nextjs/server";
import { AddTicketUpdateInput, ticketUpdateSchema, TicketUpdate } from "@/features/admin/tickets/tickets.schema";
import prisma from "@/lib/db";
import { ExtendedTicket } from "@/types/tickets";
import { processActionReturnData, verifyPermission } from "@/utils";

/**
 * Adds an update to a ticket's history and optionally changes its status or assignment
 * 
 * @param data - The ticket update data including message and status changes
 * @returns An object with success status, message, and updated ticket data
 */
export async function addTicketUpdate(data: AddTicketUpdateInput): ActionsReturnType<ExtendedTicket> {
  try {
    const { sessionClaims } = await auth();
    const isAuthorized = await verifyPermission({
      userId: sessionClaims?.metadata.data.id as string,
      permissions: {
        messages: { canRead: true, canUpdate: true },
      }
    });

    if (!isAuthorized) {
      return {
        success: false,
        message: "Unauthorized",
        errors: { general: "You are not authorized to update this ticket" },
      };
    }

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
    const updateData: Partial<import("../tickets.schema").UpdateTicketInput> = {
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