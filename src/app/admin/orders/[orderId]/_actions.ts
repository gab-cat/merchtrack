'use server';

import { revalidatePath } from "next/cache";
import { OrderStatus, OrderPaymentStatus } from "@/types/orders";
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { sendOrderStatusEmail } from "@/lib/email-service";

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
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: newStatus,
        processedById: userId
      }, include:{
        customer: {
          select: {
            firstName: true,
            email: true,
            lastName: true
          }
        }
      }
    });

    await sendOrderStatusEmail(
      updatedOrder.id,
      updatedOrder.customer.firstName as string,
      updatedOrder.customer.email,
      newStatus,
      'sample/link'
    );

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