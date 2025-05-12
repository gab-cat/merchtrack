'use server';

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { createLog } from "@/actions/logs.actions";

/**
 * Updates the customer note for a specific order item.
 */
export async function updateOrderItemNote(
  orderId: string,
  itemId: string,
  note: string,
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
      message: "You don't have permission to update order items"
    };
  }

  try {
    // Get existing item to compare changes
    const existingItem = await prisma.orderItem.findUnique({
      where: { id: itemId },
      select: {
        customerNote: true,
        variant: {
          select: {
            product: {
              select: {
                title: true
              }
            },
            variantName: true
          }
        },
        order: {
          select: {
            customer: {
              select: {
                id: true,
              }
            }
          }
        }
      }
    });

    if (!existingItem) {
      return {
        success: false,
        message: "Order item not found"
      };
    }

    // Log the change
    const productInfo = `${existingItem.variant?.product?.title} - ${existingItem.variant?.variantName}`;
    const change = `Customer note updated from: "${existingItem.customerNote ?? ''}" to "${note ?? ''}" for item ${productInfo}`;

    // Update the item note
    await prisma.orderItem.update({
      where: { id: itemId },
      data: {
        customerNote: note
      }
    });

    await createLog({
      userId: existingItem.order.customer.id,
      reason: "Order item note updated",
      systemText: change,
      userText: `Customer note updated for item ${productInfo}`,
      createdById: userId,
    });

    // Update the order processed by ID
    await prisma.order.update({
      where: { id: orderId },
      data: {
        processedById: userId
      }
    });

    revalidatePath(`/admin/orders/${orderId}`);
    return {
      success: true,
      data: { success: true }
    };
  } catch (error) {
    console.error('Failed to update order item note:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update order item note'
    };
  }
} 