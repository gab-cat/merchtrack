'use server';

import { CreateOrderType } from "@/schema/orders.schema";
import { verifyPermission } from "@/utils/permissions";
import { ExtendedOrder } from "@/types/orders";
import prisma from "@/lib/db";

type CreateOrderParams = {
    userId: string
    order: CreateOrderType
}

export async function createOrder({ params }: { params: CreateOrderParams }): Promise<ActionsReturnType<ExtendedOrder>> {
  if (!await verifyPermission({ 
    userId: params.userId,  
    permissions: {
      dashboard: { canRead: true }
    }
  })) {
    return {
      success: false,
      message: "You do not have permission to perform this action"
    };
  }

  try {
    const order = await prisma.order.create({
      data: {
        customerId: params.order.customerId,
        processedById: params.order.processedById,
        totalAmount: params.order.totalAmount,
        discountAmount: params.order.discountAmount,
        estimatedDelivery: params.order.estimatedDelivery,
        orderItems: {
          create: params.order.orderItems
        }
      },
      include: {
        customer: true,
        orderItems: true,
        processedBy: true,
      }
    });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(order)),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while creating the order"
    };
  }

}