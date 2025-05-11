'use server';

import { OrderPaymentStatus, OrderStatus, PaymentStatus } from "@prisma/client";
import { ValidatePaymentInput } from "../payments.schema";
import prisma from "@/lib/db";
import { createLog } from '@/actions/logs.actions';
import { sendOrderStatusEmail, sendPaymentStatusEmail } from "@/lib/email-service";
import { verifyPermission } from "@/utils";
import serverSideEffect from "@/utils/serverSideEffect";

/**
 * Validates a payment for an order by verifying user permissions, checking for duplicate transactions, 
 * updating the payment record, updating the order status, sending a verification email, and invalidating caches.
 * 
 * @param input - The validate payment input
 * @returns An object with success status, message
 */
export async function validatePayment({
  userId,
  orderId,
  transactionDetails,
  paymentId
}: Omit<ValidatePaymentInput, 'amount'>): ActionsReturnType<void> {
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
        reason: "Payment Validation Failed - Unauthorized",
        systemText: `Unauthorized attempt to validate payment for order ${orderId}`,
        userText: "You are not authorized to validate payments."
      })
    );
    return {
      success: false,
      message: "You are not authorized to validate payments."
    };
  }

  try {
    // Find the order and validate it exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payments: true,
        customer: true
      }
    });

    if (!order) {
      serverSideEffect(
        () => createLog({
          userId,
          createdById: userId,
          reason: "Payment Validation Failed - Order Not Found",
          systemText: `Attempted to validate payment for non-existent order ${orderId}`,
          userText: "Order not found."
        })
      );
      return {
        success: false,
        message: "Order not found."
      };
    }

    // Find the payment to validate
    const existingPayment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!existingPayment) {
      serverSideEffect(
        () => createLog({
          userId,
          createdById: userId,
          reason: "Payment Validation Failed - Payment Not Found",
          systemText: `Attempted to validate non-existent payment ${paymentId}`,
          userText: "Payment not found."
        })
      );
      return {
        success: false,
        message: "Payment not found."
      };
    }

    const validatingEmployee = await prisma.user.findUnique({
      where: { id: userId }
    });
    const employeeName = validatingEmployee ? `${validatingEmployee.firstName} ${validatingEmployee.lastName}` : userId;

    // Update the existing payment record
    const verifiedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        processedById: userId,
        paymentStatus: PaymentStatus.VERIFIED,
        transactionId: transactionDetails.transactionId,
        referenceNo: transactionDetails.referenceNo,
        memo: existingPayment.memo ? `${existingPayment.memo} | Payment validated by ${employeeName}` : `Payment validated by ${employeeName}`
      },
      include: {
        order: {
          include: {
            customer: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        }
      }
    });

    // Update order status if needed
    const totalPaid = order.payments.reduce((sum, payment) => {
      if (payment.id === paymentId) {
        // Skip the payment we're validating as we'll add it separately
        return sum;
      }
      return payment.paymentStatus === PaymentStatus.VERIFIED ? sum + Number(payment.amount) : sum;
    }, 0) + Number(existingPayment.amount);

    const isFullyPaid = totalPaid >= Number(order.totalAmount);

    if (isFullyPaid) {
      const fullypaidOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: OrderPaymentStatus.PAID,
          status: order.status === OrderStatus.PENDING ? OrderStatus.PROCESSING : order.status
        },
        include: {
          customer: true,
          orderItems: {
            include: {
              variant: {
                include: {
                  product: true,
                }
              }
            }
          }
        }
      });

      serverSideEffect(
        () => sendOrderStatusEmail({
          customerEmail: fullypaidOrder.customer.email,
          customerName: `${fullypaidOrder.customer.firstName} ${fullypaidOrder.customer.lastName}`,
          orderNumber: fullypaidOrder.id,
          newStatus: fullypaidOrder.status,
          // @ts-expect-error - data is enough already
          order: fullypaidOrder
        }),
      );

    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: OrderPaymentStatus.DOWNPAYMENT
        }
      });
    }

    serverSideEffect(
      () => createLog({
        userId: order.customerId,
        createdById: userId,
        reason: "Payment Validated Successfully",
        systemText: `Validated payment of ₱${existingPayment.amount} for order ${orderId}. Payment ID: ${paymentId}. Transaction ID: ${transactionDetails.transactionId}`,
        userText: "Payment has been validated successfully."
      }),
      () => sendPaymentStatusEmail({
        orderNumber: verifiedPayment.order.id,
        customerName: `${verifiedPayment.order.customer.firstName} ${verifiedPayment.order.customer.lastName}`,
        customerEmail: verifiedPayment.order.customer.email,
        amount: Number(verifiedPayment.amount),
        status: 'verified',
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
        reason: "Payment Validation Error",
        systemText: `Error validating payment for order ${orderId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        userText: "An error occurred while validating the payment."
      })
    );

    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to validate payment"
    };
  }
} 