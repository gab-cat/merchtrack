'use server';

import { revalidatePath } from "next/cache";
import { OrderStatus, OrderPaymentStatus, ExtendedOrder } from "@/types/orders";
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { sendOrderStatusEmail, sendPaymentStatusEmail } from "@/lib/email-service";
import { generateSurvey } from "@/actions/survey.actions";
import { formatCurrency } from "@/utils";
import { createLog } from "@/actions/logs.actions";
import serverSideEffect from "@/utils/serverSideEffect";
import { NEXT_PUBLIC_APP_URL, NODE_ENV } from '@/config';

/**
 * Updates the status of an order and notifies the customer of the change.
 *
 * This asynchronous function first checks if the user (identified by `userId`) has the necessary
 * permissions to update orders. If the permission check fails, it returns a failure response with an
 * appropriate message. If permission is granted, the function updates the order's status in the database,
 * including updating the processor's ID, and retrieves select customer details. It then sends a status
 * update email to the customer and triggers revalidation of the relevant order pages. In case of an error
 * during the update process, it catches the exception and returns a failure response with the error message.
 *
 * @param orderId - The unique identifier of the order to update.
 * @param newStatus - The new status to assign to the order.
 * @param userId - The identifier of the user performing the update.
 * @returns A promise that resolves to an object indicating whether the update was successful. On success,
 * the returned object contains a `data` field with `{ success: true }`; on failure, it contains a `message`
 * field describing the error.
 */
export async function updateOrderStatus(
  orderId: string, 
  newStatus: OrderStatus,
  userId: string,
  reason?: string
): Promise<ActionsReturnType<{ success: boolean }>> {
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

      let surveyLink = NEXT_PUBLIC_APP_URL;
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
            const baseUrl =  NODE_ENV === 'production' ? NEXT_PUBLIC_APP_URL : 'http://localhost:3000';
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

/**
 * Updates the payment status of an order.
 *
 * @remarks
 * This asynchronous function verifies that the user (identified by `userId`) has the permission to update orders.
 * If the user lacks sufficient permissions, it returns an error response. Otherwise, it updates the payment status 
 * of the specified order (`orderId`) to the new status (`newStatus`) in the database, records the user as the one
 * who processed the update, and triggers revalidation of the relevant admin order pages.
 *
 * @param orderId - The unique identifier of the order to update.
 * @param newStatus - The new payment status to assign to the order.
 * @param userId - The unique identifier of the user performing the update.
 * @returns A promise that resolves to an object indicating whether the update was successful. On success, the response 
 * contains a data object with `{ success: true }`. If an error occurs, the response includes a failure message.
 */
export async function updateOrderPaymentStatus(
  orderId: string,
  newStatus: OrderPaymentStatus,
  userId: string
): Promise<ActionsReturnType<{ success: boolean }>> {
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
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        paymentStatus: newStatus,
        processedById: userId
      }
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');

    return {
      success: true,
      data: { success: true }
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message
    };
  }
}

/**
 * Refunds a payment and updates the corresponding order's payment status.
 *
 * This function checks if the given user has the necessary permissions to refund payments.
 * If permission is denied, it returns a failure response. If permission is granted, it then
 * performs a database transaction that:
 * - Updates the specified payment's status to 'REFUNDED' and records the processing user.
 * - Retrieves remaining payments with a verified status to determine the new payment status for the order.
 *   If verified payments remain, the order payment status is set to 'DOWNPAYMENT'; otherwise, it is set to 'PENDING'.
 * - Reverts the order's overall status to 'PROCESSING' and records the processing user.
 *
 * After the transaction, the function triggers revalidation of the order pages to reflect the updates.
 *
 * @param orderId - The unique identifier of the order to process.
 * @param paymentId - The unique identifier of the payment to refund.
 * @param userId - The identifier of the user performing the refund.
 * @returns A promise that resolves to an object indicating whether the refund operation was successful.
 *          On failure, the response includes an error message.
 */
export async function refundPayment(
  orderId: string,
  amount: number,
  reason: string,
  userId: string,
  paymentId?: string
): Promise<ActionsReturnType<{ success: boolean }>> {
  if (!await verifyPermission({
    userId,
    permissions: {
      payments: { canUpdate: true },
      orders: { canUpdate: true }
    }
  })) {
    return {
      success: false,
      message: "You don't have permission to refund payments"
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Get verified payments for the order
      const verifiedPayments = await tx.payment.findMany({
        where: { 
          orderId,
          paymentStatus: 'VERIFIED'
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      if (verifiedPayments.length === 0) {
        throw new Error("No verified payments found to refund");
      }

      let remainingRefundAmount = amount;
      
      // If specific payment ID is provided, refund that first
      if (paymentId) {
        const targetPayment = verifiedPayments.find(p => p.id === paymentId);
        if (!targetPayment) {
          throw new Error("Specified payment not found or not in VERIFIED status");
        }
        
        const paymentAmount = Number(targetPayment.amount);
        
        if (paymentAmount >= remainingRefundAmount) {
          // Payment covers full refund
          if (paymentAmount === remainingRefundAmount) {
            // Fully refund this payment
            await tx.payment.update({
              where: { id: paymentId },
              data: {
                paymentStatus: 'REFUNDED',
                memo: reason,
                processedById: userId
              }
            });
            remainingRefundAmount = 0;
          } else {
            // Partially refund this payment
            await tx.payment.update({
              where: { id: paymentId },
              data: {
                amount: paymentAmount - remainingRefundAmount
              }
            });
            
            // Create record of the refund
            await tx.payment.create({
              data: {
                amount: remainingRefundAmount,
                paymentStatus: 'REFUNDED',
                paymentMethod: 'OTHERS',
                processedById: userId,
                memo: reason,
                orderId,
                userId
              }
            });
            
            remainingRefundAmount = 0;
          }
        } else {
          // Payment doesn't cover full refund
          await tx.payment.update({
            where: { id: paymentId },
            data: {
              paymentStatus: 'REFUNDED',
              memo: reason,
              processedById: userId
            }
          });
          
          remainingRefundAmount -= paymentAmount;
        }
      }
      
      // Process remaining refund amount using other payments if needed
      if (remainingRefundAmount > 0) {
        const otherPayments = paymentId 
          ? verifiedPayments.filter(p => p.id !== paymentId) 
          : verifiedPayments;
        
        for (const payment of otherPayments) {
          const paymentAmount = Number(payment.amount);
          
          if (paymentAmount <= remainingRefundAmount) {
            // Fully refund this payment
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                paymentStatus: 'REFUNDED',
                memo: reason,
                processedById: userId,

              }
            });
            
            remainingRefundAmount -= paymentAmount;
            
            if (remainingRefundAmount === 0) break;
          } else {
            // Partially refund this payment
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                amount: paymentAmount - remainingRefundAmount
              }
            });
            
            // Create record of the refund
            await tx.payment.create({
              data: {
                amount: remainingRefundAmount,
                paymentStatus: 'REFUNDED',
                paymentMethod: 'OTHERS',
                processedById: userId,
                memo: reason,
                orderId,
                userId
              }
            });
            
            remainingRefundAmount = 0;
            break;
          }
        }
      }
      
      if (remainingRefundAmount > 0) {
        throw new Error(`Insufficient payment amount to refund. Still need to refund ${formatCurrency(remainingRefundAmount)}`);
      }

      // Get order details for email notification
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      if (!order) {
        throw new Error("Order not found");
      }
      
      // Recalculate remaining verified payments
      const updatedPayments = await tx.payment.findMany({
        where: { 
          orderId,
          paymentStatus: 'VERIFIED'
        }
      });
      
      // Calculate total remaining paid amount
      const totalPaidAmount = updatedPayments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
      );

      // Determine appropriate payment status based on remaining amount
      let newPaymentStatus = OrderPaymentStatus.PENDING;
      if (totalPaidAmount > 0) {
        newPaymentStatus = OrderPaymentStatus.DOWNPAYMENT;
      }
      if (order.status === OrderStatus.CANCELLED) {
        newPaymentStatus = OrderPaymentStatus.REFUNDED;
      }

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { 
          paymentStatus: newPaymentStatus,
          processedById: userId,
          customerNotes: `${order.customerNotes ? order.customerNotes + '\n' : ''}Refund processed: ${formatCurrency(amount)} (${reason})`
        }
      });

      // Send email notification with estimated processing time
      await sendPaymentStatusEmail({
        orderNumber: orderId,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        customerEmail: order.customer.email,
        amount: amount,
        status: 'refunded',
        refundReason: reason,
        refundDetails: {
          remainingBalance: totalPaidAmount,
          refundMethod: 'Original payment method',
          estimatedProcessingTime: '3-5 business days'
        }
      });
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');

    return {
      success: true,
      data: { success: true }
    };
  } catch (error) {
    console.error('Failed to process refund:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process refund'
    };
  }
}

/**
 * Removes an item from an order and updates inventory accordingly.
 */
export async function removeOrderItem(
  orderId: string,
  itemId: string,
  reason: string,
  userId: string
): Promise<ActionsReturnType<{ success: boolean }>> {
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

/**
 * Updates the customer notes for an order.
 */
export async function updateOrderNotes(
  orderId: string,
  notes: string,
  userId: string
): Promise<ActionsReturnType<{ success: boolean }>> {
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

/**
 * Updates the customer note for a specific order item.
 */
export async function updateOrderItemNote(
  orderId: string,
  itemId: string,
  note: string,
  userId: string
): Promise<ActionsReturnType<{ success: boolean }>> {
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