"use server";

import prisma from "@/lib/db";
import { ExtendedTicket } from "@/types/tickets";
import { calculatePagination, processActionReturnData, verifyPermission } from "@/utils";
import { PaginatedResponse, QueryParams } from "@/types/common";
import { GetObjectByTParams } from "@/types/extended";

// Schemas and mutation functions have been moved to src/features/admin/tickets/actions/

type GetTicketsParams = {
    userId: string
    params: QueryParams
}
export async function getTickets({userId, params = {}}: GetTicketsParams): Promise<ActionsReturnType<PaginatedResponse<ExtendedTicket[]>>> {
  const isAuthorized = await verifyPermission({
    userId: userId,
    permissions: {
      messages: { canRead: true },
    }
  });

  const { skip, take, page } = calculatePagination(params);

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
      skip,
      take,
    });

    const total = await prisma.ticket.count({
      where: isAuthorized ? { ...params.where } : { createdById: userId },
    });
    const lastPage = Math.ceil(total / (take ?? 1));

    return {
      success: true,
      message: "Tickets fetched successfully",
      data: {
        data: processActionReturnData(tickets, params.limitFields) as ExtendedTicket[],
        metadata: {
          page: page ?? 1,
          total: total,
          lastPage: lastPage,
          hasNextPage: (page ?? 1) < lastPage,
          hasPrevPage: (page ?? 1) > 1,
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
      messages: { canRead: true },
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