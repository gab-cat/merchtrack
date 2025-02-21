'use server';

import { CreateOrderType } from "@/schema/orders.schema";
import { verifyPermission } from "@/utils/permissions";
import { ExtendedOrder } from "@/types/orders";
import prisma from "@/lib/db";
import { processActionReturnData } from "@/utils";

type CreateOrderParams = {
    userId: string
    order: CreateOrderType
}

/**
 * Creates a new order after verifying the user's permissions and checking inventory.
 *
 * This asynchronous function checks if the user has the required dashboard read permission by calling the permission
 * verification utility. If the user lacks permission, it immediately returns a failure response with an appropriate error message.
 * Otherwise, it creates a new order in the database using the Prisma ORM based on the provided order details and includes
 * related entities such as the customer, order items, and the processing user in the returned data.
 * Additionally, it checks and updates the inventory for each order item to ensure that there is sufficient stock before creating the order.
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
    // Start a transaction to ensure inventory and order creation are atomic
    return await prisma.$transaction(async (tx) => {
      // Check and update inventory for each order item
      for (const item of params.order.orderItems) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true }
        });

        if (!variant) {
          throw new Error(`Product variant ${item.variantId} not found`);
        }

        if (variant.inventory < item.quantity) {
          throw new Error(
            `Insufficient inventory for ${variant.product.title} - ${variant.variantName}. Available: ${variant.inventory}, Requested: ${item.quantity}`
          );
        }

        // Update inventory
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            inventory: {
              decrement: item.quantity
            }
          }
        });
      }

      // Create the order after inventory check passes
      const order = await tx.order.create({
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
        data: processActionReturnData(order) as ExtendedOrder,
      };
    });
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while creating the order"
    };
  }
}