'use server';

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { ExtendedOrder } from "@/types/orders";
import { verifyPermission, processActionReturnData } from "@/utils";

/**
 * Updates an order's status, payment status, or delivery date
 */
export async function updateOrder(params: {
  userId: string;
  orderId: string;
  status?: "PENDING" | "PROCESSING" | "READY" | "DELIVERED" | "CANCELLED";
  paymentStatus?: "PENDING" | "DOWNPAYMENT" | "PAID" | "REFUNDED";
  cancellationReason?: "OUT_OF_STOCK" | "CUSTOMER_REQUEST" | "PAYMENT_FAILED" | "OTHERS";
  estimatedDelivery?: Date;
}): ActionsReturnType<ExtendedOrder> {
  const isAuthorized = await verifyPermission({
    userId: params.userId,
    permissions: {
      orders: { canUpdate: true }
    }
  });

  if (!isAuthorized) {
    return {
      success: false,
      message: "You do not have permission to update orders."
    };
  }

  try {
    const order = await prisma.order.update({
      where: { id: params.orderId },
      data: {
        status: params.status,
        paymentStatus: params.paymentStatus,
        cancellationReason: params.cancellationReason,
        estimatedDelivery: params.estimatedDelivery
      },
      include: {
        customer: true,
        processedBy: true,
        payments: true,
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

    // Generate survey when order is marked as delivered
    if (params.status === "DELIVERED") {
      // Check if a survey already exists for this order
      const existingSurvey = await prisma.customerSatisfactionSurvey.findUnique({
        where: { orderId: params.orderId }
      });

      if (!existingSurvey) {
        const defaultCategory = await prisma.surveyCategory.findFirst({
          where: { isDeleted: false }
        });

        if (defaultCategory) {
          await prisma.customerSatisfactionSurvey.create({
            data: {
              orderId: params.orderId,
              categoryId: defaultCategory.id,
              answers: {}
            }
          });
        }
      }
    }

    revalidatePath('/admin/orders');
    
    return {
      success: true,
      data: processActionReturnData(order) as ExtendedOrder
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update order"
    };
  }
} 