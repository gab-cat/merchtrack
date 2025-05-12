'use server';

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { CreateOrderType , createOrderSchema } from "@/features/admin/orders/orders.schema";
import { sendOrderConfirmationEmail } from "@/lib/email-service";
import { verifyPermission, processActionReturnData } from "@/utils";
import serverSideEffect from "@/utils/serverSideEffect";

/**
 * Creates a new order after validating the input data and verifying user permissions.
 */
export async function createOrder(userId: string, data: CreateOrderType): ActionsReturnType<CreateOrderType> {
  if (!await verifyPermission({
    userId,
    permissions: {
      orders: { canCreate: true }
    }
  })) {
    return {
      success: false,
      message: "You do not have permission to create orders"
    };
  }

  try {
    const validatedData = createOrderSchema.parse(data);
    
    const order = await prisma.order.create({
      data: {
        customerId: validatedData.customerId,
        processedById: validatedData.processedById,
        totalAmount: validatedData.totalAmount,
        discountAmount: validatedData.discountAmount,
        estimatedDelivery: validatedData.estimatedDelivery,
        customerNotes: validatedData.customerNotes,
        paymentPreference: validatedData.paymentPreference,
        orderItems: {
          createMany: {
            data: validatedData.orderItems.map(item => ({
              variantId: item.variantId,
              quantity: item.quantity,
              customerNote: item.customerNote,
              size: item.size,
              price: item.price,
              originalPrice: item.originalPrice,
              appliedRole: item.appliedRole
            }))
          }
        }
      },
      include: {
        orderItems: {
          include: {
            variant: {
              include: {
                product: true
              }
            }
          }
        },
        customer: true,
        processedBy: true,
        payments: true
      }
    });

    serverSideEffect(
      () => sendOrderConfirmationEmail({
        // @ts-expect-error - Prisma types are incorrect
        order,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        customerEmail: order.customer.email
      }));

    revalidatePath('/admin/orders');
    
    return {
      success: true,
      data: processActionReturnData(order) as CreateOrderType
    };

  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while creating the order"
    };
  }
} 