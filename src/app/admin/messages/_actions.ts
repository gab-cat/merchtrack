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