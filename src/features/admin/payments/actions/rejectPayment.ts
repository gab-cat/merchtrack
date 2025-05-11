'use server';

import { PaymentStatus } from "@prisma/client";
import { RejectPaymentInput } from "../payments.schema";
import prisma from "@/lib/db";
import { createLog } from '@/actions/logs.actions';
import { sendPaymentStatusEmail } from "@/lib/email-service";
import { verifyPermission } from "@/utils";
import serverSideEffect from "@/utils/serverSideEffect";

/**
 * Rejects a payment for a specified order.
 * 
 * @param input - The reject payment input 
 * @returns An object with success status, message
 */
export async function rejectPayment({
  userId,
  orderId,
  paymentId,
  rejectionReason
}: RejectPaymentInput): ActionsReturnType<void> {
  if (!await verifyPermission({
    userId,
    permissions: {
      payments: { canRead: true, canUpdate: true },
    }
  })) {
    serverSideEffect(
      () => createLog({
        userId,
        createdById: userId,
        reason: "Payment Rejection Failed - Unauthorized",
        systemText: `Unauthorized attempt to reject payment for order ${orderId}`,
        userText: "You are not authorized to reject payments."
      })
    );
    return {
      success: false,
      message: "You are not authorized to reject payments."
    };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true
      }
    });

    if (!order) {
      serverSideEffect(
        () => createLog({
          userId,
          createdById: userId,
          reason: "Payment Rejection Failed - Order Not Found",
          systemText: `Attempted to reject payment for non-existent order ${orderId}`,
          userText: "Order not found."
        })
      );
      return {
        success: false,
        message: "Order not found."
      };
    }
    
    // Find the payment to reject
    const existingPayment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!existingPayment) {
      serverSideEffect(
        () => createLog({
          userId,
          createdById: userId,
          reason: "Payment Rejection Failed - Payment Not Found",
          systemText: `Attempted to reject non-existent payment ${paymentId}`,
          userText: "Payment not found."
        })
      );
      return {
        success: false,
        message: "Payment not found."
      };
    }

    // Update the existing payment record with rejected status
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        paymentStatus: PaymentStatus.DECLINED,
        processedById: userId,
        memo: existingPayment.memo 
          ? `${existingPayment.memo} | Payment rejected: ${rejectionReason}` 
          : `Payment rejected: ${rejectionReason}`
      }
    });

    serverSideEffect(
      () => createLog({
        userId: order.customerId,
        createdById: userId,
        reason: "Payment Rejected",
        systemText: `Rejected payment for order ${orderId}. Payment ID: ${paymentId}. Reason: ${rejectionReason}`,
        userText: `Payment has been rejected. Reason: ${rejectionReason}`
      }),
      () => sendPaymentStatusEmail({
        orderNumber: orderId,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        customerEmail: order.customer.email,
        amount: Number(existingPayment.amount),
        status: 'declined'
      })
    );

    return {
      success: true
    };
  } catch (error) {
    serverSideEffect(
      () => createLog({
        userId,
        createdById: userId,
        reason: "Payment Rejection Error",
        systemText: `Error rejecting payment for order ${orderId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        userText: "An error occurred while rejecting the payment."
      })
    );

    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to reject payment"
    };
  }
} 