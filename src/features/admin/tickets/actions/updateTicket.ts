"use server";

import { auth } from "@clerk/nextjs/server";
import { UpdateTicketInput } from "../tickets.schema";
import prisma from "@/lib/db";
import { invalidateCache } from "@/lib/redis";
import { ExtendedTicket } from "@/types/tickets";
import { processActionReturnData, verifyPermission } from "@/utils";

/**
 * Updates an existing ticket's status, priority, or assignment
 * 
 * @param data - The ticket update data
 * @returns An object with success status, message, and updated ticket data
 */
export async function updateTicket(data: UpdateTicketInput): ActionsReturnType<ExtendedTicket> {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields: any = {}; // Using any temporarily for the update object
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