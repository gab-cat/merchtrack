"use server";

import { CreateTicketInput, ticketSchema } from "@/features/admin/tickets/tickets.schema";
import prisma from "@/lib/db";
import { ExtendedTicket } from "@/types/tickets";
import { processActionReturnData } from "@/utils";

/**
 * Creates a new support ticket in the system
 * 
 * @param data - The ticket data to be created
 * @returns An object with success status, message, and created ticket data
 */
export async function createTicket(data: CreateTicketInput): ActionsReturnType<ExtendedTicket> {
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