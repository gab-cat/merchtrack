'use server';

import { Message } from "@prisma/client";
import { render } from "@react-email/components";
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { invalidateCache } from "@/lib/redis";
import { sendEmail } from "@/lib/mailgun";
import ReplyEmailTemplate from "@/app/admin/messages/(components)/email-template";
import { formContactSchema } from "@/schema/public-contact";
import { CreateMessageType } from "@/schema/messages";
import { processActionReturnData } from "@/utils";

type ReplyToMessageParams = {
  userId: string
  messageId: string
  reply: string
}

export const replyToMessage = async ({userId, messageId, reply}: ReplyToMessageParams): Promise<ActionsReturnType<Message>> => {
  const authResult = await verifyPermission({
    userId,
    permissions: {
      dashboard: { canRead: true },
    },
    logDetails: {
      actionDescription: "Reply to message",
      userText: `Attempted to reply to message ID: ${messageId}`
    }
  });

  if (!authResult) {
    return {
      success: false,
      message: "Unauthorized access."
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

  // Log successful reply
  await prisma.log.create({
    data: {
      reason: "Message Reply Sent",
      systemText: `Admin replied to message ID: ${messageId}`,
      userText: `Reply sent to: ${messageToUpdate.email}`,
      createdBy: {
        connect: { id: userId }
      }
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
    data: processActionReturnData(replyMessage) as Message,
    message: "Message replied successfully."
  };
};

type CreateMessageParams = {
  userId: string
  formData: CreateMessageType
}

export const createMessage = async (params: CreateMessageParams): Promise<ActionsReturnType<Message>> => {
  const authResult = await verifyPermission({
    userId: params.userId,
    permissions: {
      dashboard: { canRead: true },
    },
    logDetails: {
      actionDescription: "Create new message",
      userText: `Attempted to create new message to: ${params.formData.email}`
    }
  });

  if (!authResult) {
    return {
      success: false,
      message: "Unauthorized access."
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

  // Log successful message creation
  await prisma.log.create({
    data: {
      reason: "New Message Created",
      systemText: `Admin created new message to: ${createdMessage.email} \nwith subject: ${createdMessage.subject} \nand message: ${createdMessage.message}`,
      userText: `Message sent to: ${createdMessage.email}`,
      createdBy: {
        connect: { id: params.userId }
      }
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
    data: processActionReturnData(createdMessage) as Message,
    message: "Message sent successfully."
  };
};