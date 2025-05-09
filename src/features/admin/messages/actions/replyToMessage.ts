'use server';

import { Message } from "@prisma/client";
import { render } from "@react-email/components";
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { sendEmail } from "@/lib/mailgun";
import { ReplyEmailTemplate } from "@/features/admin/messages/components";
import { processActionReturnData } from "@/utils";


type ReplyToMessageParams = {
  userId: string
  messageId: string
  reply: string
}

const replyToMessage = async ({userId, messageId, reply}: ReplyToMessageParams): ActionsReturnType<Message> => {
  const authResult = await verifyPermission({
    userId,
    permissions: {
      messages: { canRead: true, canCreate: true },
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

export default replyToMessage;
