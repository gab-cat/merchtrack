'use server';

import { Payment, PaymentStatus, OrderPaymentStatus , Prisma } from "@prisma/client";
import { RefundPaymentInput } from "../payments.schema";
import prisma from "@/lib/db";
import { createLog } from '@/actions/logs.actions';
import { sendPaymentStatusEmail } from "@/lib/email-service";
import { processActionReturnData, verifyPermission } from "@/utils";
import serverSideEffect from "@/utils/serverSideEffect";

/**
 * Refunds a payment and updates the corresponding order's payment status.
 * 
 * @param input - The refund payment input 
 * @returns An object with success status, message, and refund payment data
 */
export async function refundPayment({
  userId,
  paymentId,
  amount,
  reason
}: RefundPaymentInput): ActionsReturnType<Payment> {
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
        reason: "Payment Refund Failed - Unauthorized",
        systemText: `Unauthorized attempt to refund payment ${paymentId}`,
        userText: "You are not authorized to process refunds."
      })
    );
    return {
      success: false,
      message: "You are not authorized to process refunds."
    };
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: true,
        user: true
      }
    });

    if (!payment) {
      serverSideEffect(
        () => createLog({
          userId,
          createdById: userId,
          reason: "Payment Refund Failed - Not Found",
          systemText: `Attempted to refund non-existent payment ${paymentId}`,
          userText: "Payment not found."
        })
      );
      return {
        success: false,
        message: "Payment not found"
      };
    }

    // Check if amount to refund is valid
    if (amount > Number(payment.amount)) {
      serverSideEffect(
        () => createLog({
          userId: payment.userId,
          createdById: userId,
          reason: "Payment Refund Failed - Invalid Amount",
          systemText: `Refund amount ${amount} exceeds original payment amount ${payment.amount} for payment ${paymentId}`,
          userText: "Refund amount cannot exceed the original payment amount."
        })
      );
      return {
        success: false,
        message: "Refund amount cannot exceed the original payment amount"
      };
    }

    // Create a refund record
    const refund = await prisma.payment.create({
      data: {
        orderId: payment.orderId,
        userId: payment.userId,
        processedById: userId,
        amount: new Prisma.Decimal(-amount), // Negative amount to indicate refund
        paymentMethod: payment.paymentMethod,
        paymentSite: payment.paymentSite,
        paymentStatus: PaymentStatus.REFUNDED,
        referenceNo: payment.referenceNo,
        memo: `Refund for payment ${payment.id}. Reason: ${reason}`,
        transactionId: payment.transactionId,
        paymentProvider: payment.paymentProvider
      },
      include: {
        order: {
          include: {
            customer: {
              select: { 
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        user: true
      }
    });

    // Update order payment status if full refund
    const totalPaidAfterRefund = await prisma.payment.aggregate({
      where: { orderId: payment.orderId },
      _sum: { amount: true }
    });

    const newOrderPaymentStatus = Number(totalPaidAfterRefund._sum.amount) <= 0 
      ? OrderPaymentStatus.REFUNDED 
      : OrderPaymentStatus.DOWNPAYMENT;

    await prisma.order.update({
      where: { id: payment.orderId },
      data: { 
        paymentStatus: newOrderPaymentStatus
      }
    });

    serverSideEffect(
      () => createLog({
        userId: payment.userId,
        createdById: userId,
        reason: "Payment Refunded",
        systemText: `Refund of ₱${amount} processed for payment ${paymentId}. Reason: ${reason}`,
        userText: `Refund of ₱${amount} has been processed successfully. Reason: ${reason}`
      }),
      () => sendPaymentStatusEmail({
        orderNumber: refund.order.id,
        customerName: `${refund.order.customer.firstName} ${refund.order.customer.lastName}`,
        customerEmail: refund.order.customer.email,
        amount: Number(refund.amount),
        status: 'refunded',
        refundReason: reason
      })
    );

    return {
      success: true,
      data: processActionReturnData(refund) as Payment
    };
  } catch (error) {
    serverSideEffect(
      () => createLog({
        userId,
        createdById: userId,
        reason: "Payment Refund Error",
        systemText: `Error refunding payment ${paymentId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        userText: "An error occurred while processing the refund."
      })
    );
    
    return {
      success: false,
      message: "Error processing refund.",
      errors: { error }
    };
  }
} 