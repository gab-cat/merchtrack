'use server';

import { Payment, OrderPaymentStatus, OrderStatus , Prisma } from "@prisma/client";
import { ProcessPaymentInput } from "../payments.schema";
import prisma from "@/lib/db";
import { createLog } from '@/actions/logs.actions';
import { sendOrderStatusEmail, sendPaymentStatusEmail } from "@/lib/email-service";
import { processActionReturnData } from "@/utils";
import { ExtendedOrder } from "@/types/orders";
import serverSideEffect from "@/utils/serverSideEffect";

/**
 * Processes a payment for a specified order.
 * 
 * @param input - The payment processing input
 * @returns An object with success status, message, and processed payment data
 */
export async function processPayment({ 
  userId, 
  orderId,
  amount,
  paymentMethod,
  paymentSite,
  paymentStatus,  
  referenceNo,
  memo,
  transactionId,
  paymentProvider,
  limitFields
}: ProcessPaymentInput): ActionsReturnType<Payment> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payments: true,
        customer: true
      }
    });
    if (!order) {
      await createLog({
        userId: userId,
        createdById: userId,
        reason: "Payment Processing Failed - Invalid Order",
        systemText: `User attempted to process payment for non-existent order ${orderId}`,
        userText: "Order not found."
      });
      return {
        success: false,
        message: "Order not found."
      };
    }
    const totalPaid = order.payments.filter(payment => payment.paymentStatus === 'VERIFIED').reduce((sum, payment) => sum + Number(payment.amount), 0) + amount;
    if (totalPaid > Number(order.totalAmount)) {
      await createLog({
        userId: order.customerId,
        createdById: userId,
        reason: "Payment Processing Failed - Amount Exceeds Total",
        systemText: `Payment amount ${amount} would exceed order total ${order.totalAmount} for order ${orderId}`,
        userText: "Payment amount exceeds order total."
      });
      return {
        success: false,
        message: "Payment amount exceeds order total."
      };
    }
    const payment = await prisma.payment.create({
      data: {
        orderId,
        userId: order.customerId,
        processedById: userId,
        amount: new Prisma.Decimal(amount),
        paymentMethod,
        paymentSite,
        paymentStatus,
        referenceNo: referenceNo ?? "",
        memo,
        transactionId,
        paymentProvider
      },
      include: {
        order: true,
        user: true
      }
    });

    // For offsite pending payments, don't update order status or send emails
    const isOffsitePending = paymentSite === 'OFFSITE' && paymentStatus === 'PENDING';
    
    if (!isOffsitePending) {
      // Only update order status for non-offsite or verified payments
      const isFullyPaid = totalPaid === Number(order.totalAmount);
      
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { 
          paymentStatus: isFullyPaid ? OrderPaymentStatus.PAID : OrderPaymentStatus.DOWNPAYMENT,
          // Change order status to PROCESSING only if fully paid and current status is PENDING
          ...(isFullyPaid && order.status === OrderStatus.PENDING ? { status: OrderStatus.PROCESSING } : {})
        }
      });

      // Create success log with appropriate messaging
      await createLog({
        userId: order.customerId,
        createdById: userId,
        reason: "Payment Processed Successfully",
        systemText: `Payment of ₱${amount} processed for order ${orderId} via ${paymentMethod}. Status: ${paymentStatus}. ${isFullyPaid ? 'Order is now fully paid.' : ''}`,
        userText: `Payment of ₱${amount} has been processed successfully${isFullyPaid ? '. Your order is now fully paid.' : '.'}`
      });

      // Send payment notification email for verified payments only
      try {
        serverSideEffect(
          () => sendPaymentStatusEmail({
            orderNumber: orderId,
            customerName: `${order.customer.firstName} ${order.customer.lastName}`,
            customerEmail: order.customer.email,
            amount,
            status: 'verified'
          }),
          () => sendOrderStatusEmail({
            orderNumber: orderId,
            customerName: `${order.customer.firstName} ${order.customer.lastName}`,
            customerEmail: order.customer.email,
            newStatus: "PROCESSING",
            order: updatedOrder as ExtendedOrder
          })
        );
      } catch (emailError) {
        serverSideEffect(
          () => createLog({
            userId: order.customerId,
            createdById: userId,
            reason: "Payment Notification Email Error",
            systemText: `Error sending payment notification email for order ${orderId}: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`,
            userText: "An error occurred while sending the payment notification email."
          })
        );
      }
    } else {
      serverSideEffect(
        () => sendPaymentStatusEmail({
          orderNumber: orderId,
          customerName: `${order.customer.firstName} ${order.customer.lastName}`,
          customerEmail: order.customer.email,
          amount,
          status: 'submitted',
        }),
        () => createLog({
          userId: order.customerId,
          createdById: userId,
          reason: "Offsite Payment Submitted",
          systemText: `Offsite payment of ₱${amount} submitted for order ${orderId} via ${paymentMethod}. Awaiting verification.`,
          userText: `Your payment submission of ₱${amount} has been received and is awaiting verification by our team.`
        })
      );
    }
    
    return {
      success: true,
      data: processActionReturnData(payment, limitFields) as Payment
    };
  } catch (error) {
    serverSideEffect(
      () => createLog({
        userId: userId,
        createdById: userId,
        reason: "Payment Processing Error",
        systemText: `Error processing payment for order ${orderId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        userText: "An error occurred while processing the payment."
      })
    );
    
    return {
      success: false,
      message: "Error processing payment.",
      errors: { error }
    };
  }
} 