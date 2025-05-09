'use server';

import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { sendPaymentReminderEmail } from "@/lib/email-service";
import { paymentReminderSchema } from "@/schema/reminders.schema";


type SendPaymentReminderParams = {
  userId: string;
  orderIds: string[];
  dueDate: Date;
}

const sendPaymentReminders = async ({ userId, orderIds, dueDate }: SendPaymentReminderParams): ActionsReturnType<never> => {
  const authResult = await verifyPermission({
    userId,
    permissions: {
      messages: { canRead: true, canCreate: true },
    },
    logDetails: {
      actionDescription: "Send payment reminders",
      userText: `Attempted to send payment reminders to ${orderIds.length} orders`
    }
  });

  if (!authResult) {
    return {
      success: false,
      message: "Unauthorized access."
    };
  }

  try {
    paymentReminderSchema.parse({
      orderIds,
      dueDate
    });

    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds }
      },
      include: {
        customer: true
      }
    });

    const sendPromises = orders.map(order => {
      return sendPaymentReminderEmail({
        orderNumber: order.id,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        customerEmail: order.customer.email,
        amount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        dueDate
      });
    });

    await Promise.all(sendPromises);

    await prisma.log.createMany({
      data: orders.map(order => ({
        reason: "Payment Reminder Sent",
        systemText: `Payment reminder sent for order ID: ${order.id} with due date: ${dueDate.toISOString()}`,
        userText: `Payment reminder sent to: ${order.customer.email}`,
        createdById: userId
      }))
    });

    return {
      success: true,
      message: `Successfully sent payment reminders to ${orders.length} orders.`
    };
  } catch (error) {
    console.error("Error sending payment reminders:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
};

export default sendPaymentReminders; 