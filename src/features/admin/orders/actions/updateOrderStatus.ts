'use server';

import { revalidatePath } from "next/cache";
import { OrderStatus, OrderPaymentStatus, ExtendedOrder } from "@/types/orders";
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { sendOrderStatusEmail } from "@/lib/email-service";
import { generateSurvey } from "@/actions/survey.actions";
import serverSideEffect from "@/utils/serverSideEffect";

/**
 * Updates the status of an order and notifies the customer of the change.
 */
export async function updateOrderStatus(
  orderId: string, 
  newStatus: OrderStatus,
  userId: string,
  reason?: string
): ActionsReturnType<{ success: boolean }> {
  const isAuthorized = await verifyPermission({
    userId,
    permissions: {
      orders: { canUpdate: true }
    }
  });

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

    if (!isAuthorized && existingOrder.customerId !== userId) {
      return {
        success: false,
        message: "You don't have permission to update this order"
      };
    }

    await prisma.$transaction(async (tx) => {
      // Update the order first
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          paymentStatus: newStatus === OrderStatus.CANCELLED ? OrderPaymentStatus.REFUNDED : existingOrder.paymentStatus,
          processedById: userId,
          customerNotes: `${existingOrder.customerNotes ?? ''}${existingOrder.customerNotes ? '\n' : ''}Status changed to ${newStatus}: ${reason}`,
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

      serverSideEffect(
        // Send email notification with reason if provided
        () => sendOrderStatusEmail({
          orderNumber: updatedOrder.id,
          customerName: `${updatedOrder.customer.firstName} ${updatedOrder.customer.lastName}`,
          customerEmail: updatedOrder.customer.email,
          newStatus,
          surveyLink,
          order: updatedOrder as ExtendedOrder,
          reason: reason
        })
      );
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