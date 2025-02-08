'use server';

import { Message } from "@prisma/client";
import prisma from "@/lib/db";
import { getCached, setCached } from "@/lib/redis";
import { verifyPermission } from "@/utils/permissions";
import { QueryParams, PaginatedResponse } from "@/types/common";
import { calculatePagination, removeFields } from "@/utils/query.utils";
import { ExtendedMessage } from "@/types/messages";

type GetMessageParams = {
  messageId: string
  userId: string
}

export const getMessage = async (params: GetMessageParams): Promise<ActionsReturnType<ExtendedMessage>> => {
  const isAuthorized = await verifyPermission({
    userId: params.userId,
    permissions: {
      dashboard: { canRead: true },
    }
  });
  if (!isAuthorized) {
    return {
      success: false,
      message: "You are not authorized to view messages.",
    };
  }

  try {
    let message: Message | null = await getCached<Message>(`messages:${params.messageId}`);
    if (!message) {
      message = await prisma.message.findFirst({
        where: {
          id: params.messageId
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              clerkId: true,
            }
          }
        }
      });

      if (!message) {
        return {
          success: false,
          message: "Message not found."
        };
      }
      await setCached(`messages:${params.messageId}`, message);
    };

    return {
      success: true,
      data: JSON.parse(JSON.stringify(message))
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while fetching message.",
      errors: { error }
    };
  }
};

export const getMessages = async (
  userId: string,
  params: QueryParams = {}
): Promise<ActionsReturnType<PaginatedResponse<ExtendedMessage[]>>> => {
  const isAuthorized = await verifyPermission({
    userId: userId,
    permissions: {
      dashboard: { canRead: true },
    }
  });

  if (!isAuthorized) {
    return {
      success: false,
      message: "You are not authorized to view messages."
    };
  }

  const { skip, take, page } = calculatePagination(params);

  try {
    let messages: Message[] | null = await getCached(`messages:${page}:${take}`);
    let total = await getCached('messages:total');

    if (!messages || !total) {
      [messages, total] = await prisma.$transaction([
        prisma.message.findMany({
          skip,
          take,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                clerkId: true,
              }
            },
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.message.count()
      ]);

      await setCached(`messages:${page}:${take}`, messages);
      await setCached('messages:total', total);
    }

    const lastPage = Math.ceil(total as number / take);
    const processedMessages = messages.map(msg => 
      removeFields(msg, params.limitFields)
    );

    return {
      success: true,
      data: {
        data: JSON.parse(JSON.stringify(processedMessages)),
        metadata: {
          total: total as number,
          page,
          lastPage,
          hasNextPage: page < lastPage,
          hasPrevPage: page > 1
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while fetching messages.",
      errors: { error }
    };
  }
};