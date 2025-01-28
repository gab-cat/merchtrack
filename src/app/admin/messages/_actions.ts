'use server';

import { Message } from "@prisma/client";
// eslint-disable-next-line import/named
import { render } from "@react-email/components";
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { getCached, setCached, invalidateCache } from "@/lib/redis";
import { sendEmail } from "@/lib/mailgun";
import ReplyEmailTemplate from "@/app/admin/messages/(components)/email-template";

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

  let messages: Message[] | null = await getCached<Message[]>('messages');
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
          }
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    await setCached('messages', messages);
  }

  return {
    success: true,
    data: JSON.parse(JSON.stringify(messages))
  };
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

  // Send the reply message to the user's email using Mailgun and the template
  const emailContent = ReplyEmailTemplate({ 
    replyContent: reply,
    customerName: messageToUpdate.email ,
    subject: messageToUpdate.subject
  });
  const emailContentHtml = await render(emailContent);

  await sendEmail({
    to: messageToUpdate.email,
    subject: `Re: ${messageToUpdate.subject}`,
    text: emailContentHtml,
    from: 'MerchTrack Support <no-reply@merchtrack.tech>'
  });

  // Invalidate the cache for messages
  await invalidateCache(['messages']);

  return {
    success: true,
    data: JSON.parse(JSON.stringify(replyMessage)),
    message: "Message replied successfully."
  };
};