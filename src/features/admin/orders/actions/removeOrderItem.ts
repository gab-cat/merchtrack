'use server';

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { ExtendedOrder } from "@/types/orders";
import { verifyPermission } from "@/utils/permissions";
import { sendOrderStatusEmail } from "@/lib/email-service";
import serverSideEffect from "@/utils/serverSideEffect";

/**
 * Removes an item from an order and updates inventory accordingly.
 */
export async function removeOrderItem(
  orderId: string,
  itemId: string,
  reason: string,
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
      message: "You don't have permission to modify orders"
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Get the order item details with full product information
      const item = await tx.orderItem.findUnique({
        where: { id: itemId },
        include: {
          variant: {
            include: {
              product: true
            }
          },
          order: {
            include: {
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
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
              },
              payments: true,
              customerSatisfactionSurvey: true
            }
          }
        }
      });

      if (!item) {
        throw new Error("Order item not found");
      }

      // Restore inventory
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

      // Remove the item
      await tx.orderItem.delete({
        where: { id: itemId }
      });

      // Recalculate order total
      const remainingItems = await tx.orderItem.findMany({
        where: { orderId }
      });

      const newTotal = remainingItems.reduce(
        (sum, item) => sum + (Number(item.price) * item.quantity),
        0
      );

      // Update order total and notes
      const newOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          totalAmount: newTotal,
          customerNotes: `${item.order.customerNotes ?? ''}\nItem removed: ${item.variant.product.title} - ${item.variant.variantName} (${reason})`
        },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true
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
          },
          CustomerSatisfactionSurvey: true,
          payments: true
        }
      });

      // Send detailed email notification
      serverSideEffect(
        () => sendOrderStatusEmail({
          orderNumber: orderId,
          customerName: `${item.order.customer.firstName} ${item.order.customer.lastName}`,
          customerEmail: item.order.customer.email,
          newStatus: item.order.status,
          order: newOrder as ExtendedOrder,
          reason: `Item removed: ${item.variant.product.title} - ${item.variant.variantName}\nReason: ${reason}`
        })
      );
    });

    revalidatePath(`/admin/orders/${orderId}`);
    return {
      success: true,
      data: { success: true }
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to remove item'
    };
  }
} 