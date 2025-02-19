'use server';

import { CreateOrderType } from "@/schema/orders.schema";
import { verifyPermission } from "@/utils/permissions";
import { ExtendedOrder } from "@/types/orders";
import prisma from "@/lib/db";

type CreateOrderParams = {
    userId: string
    order: CreateOrderType
}

/**
 * Creates a new order after verifying the user's permissions.
 *
 * This asynchronous function checks if the user has the required dashboard read permission by calling the permission
 * verification utility. If the user lacks permission, it immediately returns a failure response with an appropriate error message.
 * Otherwise, it creates a new order in the database using the Prisma ORM based on the provided order details and includes
 * related entities such as the customer, order items, and the processing user in the returned data.
 *
 * @param params - An object containing the order creation parameters.
 * @param params.userId - The ID of the user attempting to create the order.
 * @param params.order - The order details including:
 *   - customerId: The ID of the customer associated with the order.
 *   - processedById: The ID of the user processing the order.
 *   - totalAmount: The total amount for the order.
 *   - discountAmount: The discount applied to the order.
 *   - estimatedDelivery: The estimated delivery date.
 *   - orderItems: An array of items to be created as part of the order.
 *
 * @returns A promise that resolves to an object indicating the outcome of the operation:
 *   - On success: { success: true, data: ExtendedOrder } where ExtendedOrder contains the created order details and related data.
 *   - On failure: { success: false, message: string } where the message describes the error.
 *
 * @example
 * const result = await createOrder({
 *   params: {
 *     userId: "user123",
 *     order: {
 *       customerId: "customer456",
 *       processedById: "processor789",
 *       totalAmount: 150.0,
 *       discountAmount: 15.0,
 *       estimatedDelivery: new Date("2025-03-15"),
 *       orderItems: [
 *         { /* order item details */ },
 *         { /* another order item */ }
 *       ]
 *     }
 *   }
 * });
 *
 * if (result.success) {
 *   console.log("Order created:", result.data);
 * } else {
 *   console.error("Error creating order:", result.message);
 * }
 */
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