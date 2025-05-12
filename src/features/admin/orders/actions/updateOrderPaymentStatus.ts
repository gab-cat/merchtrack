'use server';

import { revalidatePath } from "next/cache";
import { OrderPaymentStatus } from "@/types/orders";
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";

/**
 * Updates the payment status of an order.
 */
export async function updateOrderPaymentStatus(
  orderId: string,
  newStatus: OrderPaymentStatus,
  userId: string
): ActionsReturnType<{ success: boolean }> {
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