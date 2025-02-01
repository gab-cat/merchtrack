'use server';

import { Message } from "@prisma/client";
import prisma from "@/lib/db";
import { getCached, setCached } from "@/lib/redis";
import { verifyPermission } from "@/utils/permissions";


type GetMessageParams = {
  messageId: string
  userId: string
}

export const getMessage = async (params: GetMessageParams): Promise<ActionsReturnType<Message>> => {
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
      await setCached(`message:${params.messageId}`, message);
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

export const getMessages = async (userId: string): Promise<ActionsReturnType<Message[]>> => {
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

  try {
    let messages: Message[] | null = await getCached<Message[]>('messages:all');
    if (!messages || messages.length === 0) {
      messages = await prisma.message.findMany({
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
        orderBy: {
          createdAt: 'desc'
        }
      });
      await setCached('messages:all', messages);
    }
  
    return {
      success: true,
      data: JSON.parse(JSON.stringify(messages))
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while fetching messages.",
      errors: { error }
    };
  }
};