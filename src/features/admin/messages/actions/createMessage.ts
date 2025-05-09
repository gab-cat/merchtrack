'use server';

import { Message } from "@prisma/client";
import { render } from "@react-email/components";
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { sendEmail } from "@/lib/mailgun";
import { ReplyEmailTemplate } from "@/features/admin/messages/components";
import { CreateMessageType, createMessageSchema } from "@/features/admin/messages/messages.schema";


type CreateMessageParams = {
  userId: string
  formData: CreateMessageType
}

const createMessage = async (params: CreateMessageParams): ActionsReturnType<Message> => {
  const authResult = await verifyPermission({
    userId: params.userId,
    permissions: {
      messages: { canCreate: true },
    },
    logDetails: {
      actionDescription: "Create new message",
      userText: `Attempted to create new message to: ${params.formData.emails.join(', ')}`,
    }
  });

  if (!authResult) {
    return {
      success: false,
      message: "Unauthorized access."
    };
  }

  try {
    const result = createMessageSchema.safeParse(params.formData);

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
    
    await prisma.message.createMany({
      data: result.data.emails.map(email => ({
        message: result.data.message,
        subject: result.data.subject,
        email: email,
        isSentByAdmin: true,
        sentBy: params.userId,
        isRead: true
      }))
    });
    
    await prisma.log.createMany({
      data: result.data.emails.map(email => ({
        reason: "New Message Created",
        systemText: `Admin created new message to: ${email} \nwith subject: ${result.data.subject} \nand message: ${result.data.message}`,
        userText: `Message sent to: ${email}`,
        createdById: params.userId
      }))
    });
    
    sendEmail({
      to: result.data.emails,
      subject: result.data.subject,
      html: await render(ReplyEmailTemplate({
        replyContent: result.data.message,
        customerName: result.data.customerName, // This might be an issue if customerName is not part of CreateMessageType
        subject: result.data.subject
      })),
      from: 'MerchTrack Support'
    });
    
    return {
      success: true,
      message: `Message sent successfully to ${result.data.emails.length} recipients.`
    };
  } catch (error) {
    console.error("Error sending messages:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
};

export default createMessage; 