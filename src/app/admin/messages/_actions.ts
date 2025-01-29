'use server';

import { Message } from "@prisma/client";
// eslint-disable-next-line import/named
import { render } from "@react-email/components";
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { getCached, setCached, invalidateCache } from "@/lib/redis";
import { sendEmail } from "@/lib/mailgun";
import ReplyEmailTemplate from "@/app/admin/messages/(components)/email-template";
import { formContactSchema } from "@/schema/public-contact";
import { CreateMessageType } from "@/schema/messages";

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
      message: "You are not authorized to view messages."
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

type ReplyToMessageParams = {
  userId: string
  messageId: string
  reply: string
}


export const replyToMessage = async ({userId, messageId, reply}: ReplyToMessageParams): Promise<ActionsReturnType<Message>> => {
  const isAuthorized = await verifyPermission({
    userId: userId,
    permissions: {
      dashboard: { canRead: true },
    }
  });

  if (!isAuthorized) {
    return {
      success: false,
      message: "You are not authorized to reply to messages."
    };
  }

  const messageToUpdate = await prisma.message.update({
    where: {
      id: messageId
    },
    data: {
      isRead: true
    },
  });

  const replyMessage = await prisma.message.create({
    data: {
      subject: `Re: ${messageToUpdate.subject}`,
      message: reply,
      isRead: true,
      isSentByAdmin: true,
      repliesToId: messageToUpdate.id,
      email: messageToUpdate.email,
      sentBy: userId,
    },
    include: {
      user: true
    }
  });

  await invalidateCache(['messages:all', `messages:${messageId}`]);
  await sendEmail({
    to: messageToUpdate.email,
    subject: `Re: ${messageToUpdate.subject}`,
    html: await render(ReplyEmailTemplate({ 
      replyContent: reply,
      customerName: messageToUpdate.email,
      subject: messageToUpdate.subject
    })),
    from: 'MerchTrack Support'
  });

  return {
    success: true,
    data: JSON.parse(JSON.stringify(replyMessage)),
    message: "Message replied successfully."
  };
};




type CreateMessageParams = {
  userId: string
  formData: CreateMessageType
}

export const createMessage = async (params: CreateMessageParams): Promise<ActionsReturnType<Message>> => {
  const isAuthorized = await verifyPermission({
    userId: params.userId,
    permissions: {
      dashboard: { canRead: true },
    }
  });

  if (!isAuthorized) {
    return {
      success: false,
      message: "You are not authorized to reply to messages."
    };
  }

  const result = formContactSchema.safeParse(params.formData);

  if (!result.success) {
    const errors = result.error.errors.reduce((acc: Record<string, string>, error) => {
      acc[error.path[0]] = error.message;
      return acc;
    }, {});

    return {
      success: false,
      message: "There are errors in the form.",
      errors, 
    };
  }

  const createdMessage = await prisma.message.create({
    data: {
      ...result.data,
      isSentByAdmin: true,
      sentBy: params.userId,
      isRead: true
    },
    include: {
      user: true
    }
  });

  await invalidateCache(['messages:all']);
  await sendEmail({
    to: createdMessage.email,
    subject: createdMessage.subject,
    html: await render(ReplyEmailTemplate({
      replyContent: createdMessage.message,
      customerName: params.formData.customerName,
      subject: createdMessage.subject
    })),
    from: 'MerchTrack Support'
  });

  return {
    success: true,
    data: JSON.parse(JSON.stringify(createdMessage)),
    message: "Message sent successfully."
  };
};