'use server';

import { Message } from "@prisma/client";
import prisma from "@/lib/db";
import { getCached, setCached } from "@/lib/redis";
import { QueryParams, PaginatedResponse } from "@/types/common";
import { ExtendedMessage } from "@/types/messages";
import { GetObjectByTParams } from "@/types/extended";
import { processActionReturnData, calculatePagination, verifyPermission } from "@/utils";


export const getMessage = async (params: GetObjectByTParams<"messageId">): Promise<ActionsReturnType<ExtendedMessage>> => {
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
      data: processActionReturnData(message, params.limitFields) as ExtendedMessage
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
    const cacheKey = `messages:${page}:${take}:${userId}:${JSON.stringify(params.where)}`;
    let messages: Message[] | null = await getCached(cacheKey);
    let total = await getCached(`messages:total:${userId}:${JSON.stringify(params.where)}`);

    if (!messages || !total) {
      [messages, total] = await prisma.$transaction([
        prisma.message.findMany({
          where: {
            ...params.where,
          },
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
          orderBy: params.orderBy ?? { createdAt: 'desc' }
        }),
        prisma.message.count({ 
          where: {
            ...params.where,
          } 
        })
      ]);

      await setCached(cacheKey, messages);
      await setCached(`messages:total:${userId}:${JSON.stringify(params.where)}`, total);
    }

    const lastPage = Math.ceil(total as number / take);

    return {
      success: true,
      data: {
        data: processActionReturnData(messages, params.limitFields) as ExtendedMessage[],
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