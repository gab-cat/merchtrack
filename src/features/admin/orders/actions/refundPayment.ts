'use server';

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { OrderStatus, OrderPaymentStatus } from "@/types/orders";
import { verifyPermission } from "@/utils/permissions";
import { sendPaymentStatusEmail } from "@/lib/email-service";
import { formatCurrency } from "@/utils";

/**
 * Refunds a payment and updates the corresponding order's payment status.
 */
export async function refundPayment(
  orderId: string,
  amount: number,
  reason: string,
  userId: string,
  paymentId?: string
): ActionsReturnType<{ success: boolean }> {
  if (!await verifyPermission({
    userId,
    permissions: {
      payments: { canUpdate: true },
      orders: { canUpdate: true }
    }
  })) {
    return {
      success: false,
      message: "You don't have permission to refund payments"
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Get verified payments for the order
      const verifiedPayments = await tx.payment.findMany({
        where: { 
          orderId,
          paymentStatus: 'VERIFIED'
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      if (verifiedPayments.length === 0) {
        throw new Error("No verified payments found to refund");
      }

      let remainingRefundAmount = amount;
      
      // If specific payment ID is provided, refund that first
      if (paymentId) {
        const targetPayment = verifiedPayments.find(p => p.id === paymentId);
        if (!targetPayment) {
          throw new Error("Specified payment not found or not in VERIFIED status");
        }
        
        const paymentAmount = Number(targetPayment.amount);
        
        if (paymentAmount >= remainingRefundAmount) {
          // Payment covers full refund
          if (paymentAmount === remainingRefundAmount) {
            // Fully refund this payment
            await tx.payment.update({
              where: { id: paymentId },
              data: {
                paymentStatus: 'REFUNDED',
                memo: reason,
                processedById: userId
              }
            });
            remainingRefundAmount = 0;
          } else {
            // Partially refund this payment
            await tx.payment.update({
              where: { id: paymentId },
              data: {
                amount: paymentAmount - remainingRefundAmount
              }
            });
            
            // Create record of the refund
            await tx.payment.create({
              data: {
                amount: remainingRefundAmount,
                paymentStatus: 'REFUNDED',
                paymentMethod: 'OTHERS',
                processedById: userId,
                memo: reason,
                orderId,
                userId
              }
            });
            
            remainingRefundAmount = 0;
          }
        } else {
          // Payment doesn't cover full refund
          await tx.payment.update({
            where: { id: paymentId },
            data: {
              paymentStatus: 'REFUNDED',
              memo: reason,
              processedById: userId
            }
          });
          
          remainingRefundAmount -= paymentAmount;
        }
      }
      
      // Process remaining refund amount using other payments if needed
      if (remainingRefundAmount > 0) {
        const otherPayments = paymentId 
          ? verifiedPayments.filter(p => p.id !== paymentId) 
          : verifiedPayments;
        
        for (const payment of otherPayments) {
          const paymentAmount = Number(payment.amount);
          
          if (paymentAmount <= remainingRefundAmount) {
            // Fully refund this payment
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                paymentStatus: 'REFUNDED',
                memo: reason,
                processedById: userId,

              }
            });
            
            remainingRefundAmount -= paymentAmount;
            
            if (remainingRefundAmount === 0) break;
          } else {
            // Partially refund this payment
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                amount: paymentAmount - remainingRefundAmount
              }
            });
            
            // Create record of the refund
            await tx.payment.create({
              data: {
                amount: remainingRefundAmount,
                paymentStatus: 'REFUNDED',
                paymentMethod: 'OTHERS',
                processedById: userId,
                memo: reason,
                orderId,
                userId
              }
            });
            
            remainingRefundAmount = 0;
            break;
          }
        }
      }
      
      if (remainingRefundAmount > 0) {
        throw new Error(`Insufficient payment amount to refund. Still need to refund ${formatCurrency(remainingRefundAmount)}`);
      }

      // Get order details for email notification
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      if (!order) {
        throw new Error("Order not found");
      }
      
      // Recalculate remaining verified payments
      const updatedPayments = await tx.payment.findMany({
        where: { 
          orderId,
          paymentStatus: 'VERIFIED'
        }
      });
      
      // Calculate total remaining paid amount
      const totalPaidAmount = updatedPayments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
      );

      // Determine appropriate payment status based on remaining amount
      let newPaymentStatus = OrderPaymentStatus.PENDING;
      if (totalPaidAmount > 0) {
        newPaymentStatus = OrderPaymentStatus.DOWNPAYMENT;
      }
      if (order.status === OrderStatus.CANCELLED) {
        newPaymentStatus = OrderPaymentStatus.REFUNDED;
      }

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { 
          paymentStatus: newPaymentStatus,
          processedById: userId,
          customerNotes: `${order.customerNotes ? order.customerNotes + '\n' : ''}Refund processed: ${formatCurrency(amount)} (${reason})`
        }
      });

      // Send email notification with estimated processing time
      await sendPaymentStatusEmail({
        orderNumber: orderId,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        customerEmail: order.customer.email,
        amount: amount,
        status: 'refunded',
        refundReason: reason,
        refundDetails: {
          remainingBalance: totalPaidAmount,
          refundMethod: 'Original payment method',
          estimatedProcessingTime: '3-5 business days'
        }
      });
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');

    return {
      success: true,
      data: { success: true }
    };
  } catch (error) {
    console.error('Failed to process refund:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process refund'
    };
  }
} 