'use server';

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { createLog } from "@/actions/logs.actions";

/**
 * Updates the customer notes for an order.
 */
export async function updateOrderNotes(
  orderId: string,
  notes: string,
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
    // Get existing order to compare changes
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        customerNotes: true,
        customer: {
          select: {
            email: true,
            id: true,
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

    // Log the change
    const change = `Customer notes updated from: "${existingOrder.customerNotes ?? ''}" to "${notes ?? ''}"`;

    // Update the order notes
    await prisma.order.update({
      where: { id: orderId },
      data: {
        customerNotes: notes,
      }
    });

    await createLog({
      userId: existingOrder.customer.id,
      reason: "Order notes updated",
      systemText: change,
      userText: `Customer notes updated for order ${orderId}`,
      createdById: userId,
    });

    revalidatePath(`/admin/orders/${orderId}`);
    return {
      success: true,
      data: { success: true }
    };
  } catch (error) {
    console.error('Failed to update order notes:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update order notes'
    };
  }
} 