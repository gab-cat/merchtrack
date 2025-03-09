'use server';

import { revalidatePath } from "next/cache";
import { Order, OrderPaymentStatus, OrderStatus, Prisma } from "@prisma/client";
import { z } from "zod";
import { createLog } from "./logs.actions";
import prisma from "@/lib/db";
import { validateCartItems } from "@/lib/cart";
import { processActionReturnData } from "@/utils";
import { sendOrderConfirmationEmail } from "@/lib/email-service";

const checkoutSchema = z.object({
  userId: z.string(),
  items: z.array(z.object({
    variantId: z.string(),
    quantity: z.number(),
    price: z.number(),
  })),
  customerNotes: z.string().max(500, 'Note cannot exceed 500 characters').optional()
});

type CheckoutInput = z.infer<typeof checkoutSchema>;

export async function processCheckout(input: CheckoutInput): Promise<ActionsReturnType<Order>> {
  try {
    // Validate input
    const validatedInput = checkoutSchema.parse(input);

    // Calculate total amount
    const totalAmount = validatedInput.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Validate inventory
    const variants = await prisma.productVariant.findMany({
      where: {
        id: { in: validatedInput.items.map(item => item.variantId) }
      },
      include: {
        product: {
          select: {
            title: true,
            imageUrl: true,
          }
        }
      }
    });

    const cartItems = validatedInput.items.map(item => ({
      ...item,
      variant: variants.find(v => v.id === item.variantId)!,
      selected: true // or false, depending on your logic
    }));

    const validation = validateCartItems(cartItems);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.error!
      };
    }

    // Create order and payment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          customerId: validatedInput.userId,
          totalAmount,
          status: OrderStatus.PENDING,
          paymentStatus: OrderPaymentStatus.PENDING,
          estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 
          customerNotes: validatedInput.customerNotes,
          orderItems: {
            create: validatedInput.items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              price: new Prisma.Decimal(item.price),
              originalPrice: new Prisma.Decimal(item.price),
              appliedRole: "OTHERS", // Default role for now
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              variant: {
                include: {
                  product: {
                    select: {
                      title: true,
                      imageUrl: true,
                    }
                  }
                }
              } 
            }
          },
          customer: true,
          processedBy: true,
          payments: true
        },
      });

      // Update inventory
      await Promise.all(
        validatedInput.items.map((item) =>
          tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              inventory: {
                decrement: item.quantity
              }
            }
          })
        )
      );

      await sendOrderConfirmationEmail({
        // @ts-expect-error - no need for other fields
        order,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        customerEmail: order.customer.email
      });

      return order;
    });

    // Create log entry
    await createLog({
      userId: validatedInput.userId,
      createdById: validatedInput.userId,
      reason: "Order Created",
      systemText: `Order ${result.id} created by ${result.customer?.firstName ?? 'Unknown'}`,
      userText: "Order created successfully",
    });



    revalidatePath('/orders');
    revalidatePath('/checkout');

    return {
      success: true,
      data: processActionReturnData(result) as Order,
    };
  } catch (error) {
    console.error('Checkout error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process checkout',
    };
  }
}