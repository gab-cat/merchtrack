'use server';

import { revalidatePath } from "next/cache";
import { OrderStatus, OrderPaymentStatus, ExtendedOrder } from "@/types/orders";
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { sendOrderStatusEmail } from "@/lib/email-service";
import { generateSurvey } from "@/actions/survey.actions";

/**
 * Updates the status of an order and notifies the customer of the change.
 *
 * This asynchronous function first checks if the user (identified by `userId`) has the necessary
 * permissions to update orders. If the permission check fails, it returns a failure response with an
 * appropriate message. If permission is granted, the function updates the order's status in the database,
 * including updating the processor's ID, and retrieves select customer details. It then sends a status
 * update email to the customer and triggers revalidation of the relevant order pages. In case of an error
 * during the update process, it catches the exception and returns a failure response with the error message.
 *
 * @param orderId - The unique identifier of the order to update.
 * @param newStatus - The new status to assign to the order.
 * @param userId - The identifier of the user performing the update.
 * @returns A promise that resolves to an object indicating whether the update was successful. On success,
 * the returned object contains a `data` field with `{ success: true }`; on failure, it contains a `message`
 * field describing the error.
 */
export async function updateOrderStatus(
  orderId: string, 
  newStatus: OrderStatus,
  userId: string
): Promise<ActionsReturnType<{ success: boolean }>> {
  if (!await verifyPermission({
    userId,
    permissions: {
      orders: { canUpdate: true }
    }
  })) {
    return {
      success: false,
      message: "You don't have permission to update orders"
    };
  }

  try {
    // Validate order exists before proceeding
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            variant: true
          }
        },
        customer: {
          select: {
            firstName: true,
            email: true,
            lastName: true
          }
        }
      }
    });

    if (!existingOrder) {
      return {
        success: false,
        message: "Order not found"
      };
    }

    await prisma.$transaction(async (tx) => {
      // Update the order first
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          processedById: userId,
        },
        include: {
          customer: {
            select: {
              firstName: true,
              email: true,
              lastName: true
            }
          },
          orderItems: {
            include: {
              variant: {
                include: {
                  product: true
                }
              }
            }
          }
        }
      });

      // If the order is being cancelled, restore the inventory
      if (newStatus === OrderStatus.CANCELLED && existingOrder.status !== OrderStatus.CANCELLED) {
        // Restore inventory for each item
        for (const item of existingOrder.orderItems) {
          if (item.variant) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                inventory: {
                  increment: item.quantity
                }
              }
            });
          }
        }
      }

      let surveyLink = process.env.NEXT_PUBLIC_APP_URL;
      // Only generate survey for delivered orders
      if (newStatus === OrderStatus.DELIVERED) {
        const surveyCategory = await tx.surveyCategory.findFirst({
          where: { 
            isDeleted: false, 
            name: 'Platform Survey'
          },
        });

        if (surveyCategory) {
          const surveyResponse = await generateSurvey({
            orderId: updatedOrder.id,
            categoryId: surveyCategory.id
          });

          if (surveyResponse.success && surveyResponse.data) {
            const baseUrl = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_APP_URL : 'http://localhost:3000';
            surveyLink = `${baseUrl}/survey?id=${surveyResponse.data.id}`;
          } else {
            console.error('Failed to generate survey:', surveyResponse.message);
          }
        }
      }

      // Send email notification
      await sendOrderStatusEmail({
        orderNumber: updatedOrder.id,
        customerName: `${updatedOrder.customer.firstName} ${updatedOrder.customer.lastName}`,
        customerEmail: updatedOrder.customer.email,
        newStatus,
        surveyLink,
        order: updatedOrder as ExtendedOrder
      });
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');

    return {
      success: true,
      data: { success: true }
    };
  } catch (error) {
    console.error('Failed to update order status:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Updates the payment status of an order.
 *
 * @remarks
 * This asynchronous function verifies that the user (identified by `userId`) has the permission to update orders.
 * If the user lacks sufficient permissions, it returns an error response. Otherwise, it updates the payment status 
 * of the specified order (`orderId`) to the new status (`newStatus`) in the database, records the user as the one
 * who processed the update, and triggers revalidation of the relevant admin order pages.
 *
 * @param orderId - The unique identifier of the order to update.
 * @param newStatus - The new payment status to assign to the order.
 * @param userId - The unique identifier of the user performing the update.
 * @returns A promise that resolves to an object indicating whether the update was successful. On success, the response 
 * contains a data object with `{ success: true }`. If an error occurs, the response includes a failure message.
 */
export async function updateOrderPaymentStatus(
  orderId: string,
  newStatus: OrderPaymentStatus,
  userId: string
): Promise<ActionsReturnType<{ success: boolean }>> {
  if (!await verifyPermission({
    userId,
    permissions: {
      orders: { canUpdate: true }
    }
  })) {
    return {
      success: false,
      message: "You don't have permission to update orders"
    };
  }

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        paymentStatus: newStatus,
        processedById: userId
      }
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');

    return {
      success: true,
      data: { success: true }
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message
    };
  }
}

/**
 * Refunds a payment and updates the corresponding order's payment status.
 *
 * This function checks if the given user has the necessary permissions to refund payments.
 * If permission is denied, it returns a failure response. If permission is granted, it then
 * performs a database transaction that:
 * - Updates the specified payment's status to 'REFUNDED' and records the processing user.
 * - Retrieves remaining payments with a verified status to determine the new payment status for the order.
 *   If verified payments remain, the order payment status is set to 'DOWNPAYMENT'; otherwise, it is set to 'PENDING'.
 * - Reverts the order's overall status to 'PROCESSING' and records the processing user.
 *
 * After the transaction, the function triggers revalidation of the order pages to reflect the updates.
 *
 * @param orderId - The unique identifier of the order to process.
 * @param paymentId - The unique identifier of the payment to refund.
 * @param userId - The identifier of the user performing the refund.
 * @returns A promise that resolves to an object indicating whether the refund operation was successful.
 *          On failure, the response includes an error message.
 */
export async function refundPayment(
  orderId: string,
  paymentId: string,
  userId: string
): Promise<ActionsReturnType<{ success: boolean }>> {
  if (!await verifyPermission({
    userId,
    permissions: {
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
      // Update payment status to refunded
      await tx.payment.update({
        where: { id: paymentId },
        data: { 
          paymentStatus: 'REFUNDED',
          processedById: userId
        }
      });

      // Get remaining valid payments
      const remainingPayments = await tx.payment.findMany({
        where: { 
          orderId,
          paymentStatus: 'VERIFIED' // Only count verified payments
        }
      });

      // Determine appropriate payment status based on remaining payments
      let newPaymentStatus = OrderPaymentStatus.PENDING;
      if (remainingPayments.length > 0) {
        // If there are still some payments, mark as downpayment
        newPaymentStatus = OrderPaymentStatus.DOWNPAYMENT;
      }

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { 
          paymentStatus: newPaymentStatus,
          status: OrderStatus.PROCESSING, // Revert back to processing
          processedById: userId
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
    return {
      success: false,
      message: (error as Error).message
    };
  }
}