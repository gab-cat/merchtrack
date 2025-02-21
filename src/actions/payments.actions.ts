'use server';

import { OrderPaymentStatus, Payment, PaymentSite, PaymentStatus, PaymentMethod, Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { getCached, setCached } from "@/lib/redis";
import { QueryParams, PaginatedResponse } from "@/types/common";
import { GetObjectByTParams } from "@/types/extended";
import { createLog } from '@/actions/logs.actions';
import { sendPaymentStatusEmail } from "@/lib/email-service";
import { calculatePagination, processActionReturnData, verifyPermission } from "@/utils";


/**
 * Retrieves a paginated list of payments for the specified user.
 *
 * This asynchronous function first verifies that the user has permission to read payments from the dashboard.
 * It calculates pagination parameters based on the provided query parameters and attempts to fetch payments and the total
 * count from the cache. If the data is not available in the cache, it performs a database query using a transaction,
 * caches the results, and processes the payment records to remove any fields specified in the query parameters.
 *
 * @param userId - The identifier of the user making the request.
 * @param params - Optional query parameters for pagination and field limitation (e.g., page, take, limitFields).
 * @returns A promise resolving to an object with the following structure:
 *   - success: Indicates whether the operation was successful.
 *   - data (if successful): An object containing:
 *     - data: An array of processed payment records.
 *     - metadata: An object containing pagination details:
 *       - total: Total number of payments.
 *       - page: Current page number.
 *       - lastPage: The last available page number.
 *       - hasNextPage: Boolean indicating if a next page exists.
 *       - hasPrevPage: Boolean indicating if a previous page exists.
 *
 * @example
 * // Retrieve the first page of payments with default pagination settings
 * const result = await getPayments("user123");
 *
 * @example
 * // Retrieve the second page of payments with 10 items per page and limit certain fields
 * const result = await getPayments("user123", { page: 2, take: 10, limitFields: ["sensitiveField"] });
 */
export async function getPayments(
  userId: string,
  params: QueryParams = {}
): Promise<ActionsReturnType<PaginatedResponse<Payment[]>>> {
  if (!await verifyPermission({
    userId: userId,
    permissions: {
      dashboard: { canRead: true },
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to view payments."
    };
  }

  const { skip, take, page } = calculatePagination(params);

  try {
    let payments: Payment[] | null = await getCached(`payments:${page}:${take}`);
    let total = await getCached('payments:total');

    if (!payments || !total) {
      [payments, total] = await prisma.$transaction([
        prisma.payment.findMany({
          where: { ...params.where },
          include: {
            order: true,
            user: true,
          },
          orderBy: params.orderBy,
          skip,
          take
        }),
        prisma.payment.count({ where: { isDeleted: false } })
      ]);
      
      await setCached(`payments:${page}:${take}`, payments);
      await setCached('payments:total', total);
    }

    const lastPage = Math.ceil(total as number / take);

    return {
      success: true,
      data: {
        data: processActionReturnData(payments, params.limitFields) as Payment[],
        metadata: {
          total: total as number,
          page,
          lastPage,
          hasNextPage: page < lastPage,
          hasPrevPage: page > 1
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      message: "Error fetching payments.",
      errors: { error }
    };
  }
}


/**
 * Retrieves a payment by its ID after verifying user permissions.
 *
 * This function ensures that the requesting user has the necessary permission to read payment data.
 * It first attempts to obtain a cached payment using the provided payment ID. If a cached value is found,
 * the function retrieves up-to-date payment details from the database (including associated order and user data),
 * updates the cache, and then processes the payment data by removing specified fields.
 *
 * The function returns a structured response:
 * - On success, it returns the payment data with limited fields.
 * - If the user is not authorized, it returns an error message indicating insufficient permissions.
 * - If the payment is not found or an error occurs during the fetch, it returns an error message along with error details.
 *
 * @param userId - The identifier of the user making the request.
 * @param paymentId - The unique identifier of the payment to retrieve.
 * @param limitFields - An array specifying which fields should be omitted from the returned payment data.
 * @returns A promise that resolves to an object containing a success flag, the payment data on success,
 *          or an error message (and error details) on failure.
 */
export async function getPaymentById({ userId, paymentId, limitFields }: GetObjectByTParams<'paymentId'>): Promise<ActionsReturnType<Payment>> {
  if (!await verifyPermission({
    userId: userId,
    permissions: {
      dashboard: { canRead: true },
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to view payments."
    };
  }

  let payment: Payment | null = await getCached<Payment>(`payments:${paymentId}`);
  try {
    if (!payment) {
      payment = await prisma.payment.findFirst({
        where: {
          id: paymentId,
        },
        include: {
          order: true,
          user: true,
        }
      });

      await setCached(`payments:${paymentId}`, payment);
    }
  } catch (error) {
    return {
      success: false,
      message: "Error fetching payment.",
      errors: { error}
    };
  }
  

  if (!payment) {
    return {
      success: false,
      message: "Payment not found."
    };
  }

  return {
    success: true,
    data: processActionReturnData(payment, limitFields) as Payment
  };
}

/**
 * Retrieves payments associated with a specific customer.
 *
 * This asynchronous function first verifies that the requesting user has the dashboard read permission.
 * It then attempts to fetch payments for the specified customer from cache. If the cache is empty, it queries
 * the database for payments that are not marked as deleted, including related order and user data, and then caches
 * the result. Finally, it processes the payment records by removing fields specified in `limitFields` before
 * returning the cleaned data.
 *
 * @param userId - The ID of the user performing the request.
 * @param customerId - The ID of the customer whose payments are to be retrieved.
 * @param limitFields - A list of fields to remove from each payment object.
 * @param status - A status filter for payments (currently not used in the database query).
 *
 * @returns An object with a success flag and either the processed payment data or error details if the operation fails.
 *
 * @example
 * const response = await getPaymentsByUser({
 *   userId: "user123",
 *   customerId: "customer456",
 *   limitFields: ["sensitiveData"],
 *   status: "active"
 * });
 *
 * if (response.success) {
 *   console.log("Payments:", response.data);
 * } else {
 *   console.error("Error:", response.message);
 * }
 */
export async function getPaymentsByUser({ userId, customerId, limitFields }: GetObjectByTParams<'customerId'> & { status: string }): Promise<ActionsReturnType<Payment[]>> {
  if (!await verifyPermission({
    userId: userId,
    permissions: {
      dashboard: { canRead: true },
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to view payments."
    };
  }

  let payments: Payment[] | null = await getCached<Payment[]>(`payments:user:${customerId}`);
  try {
    if (!payments) {
      payments = await prisma.payment.findMany({
        where: {
          userId: customerId,
          isDeleted: false,
        },
        include: {
          order: true,
          user: true,
        }
      });
      await setCached(`payments:user:${customerId}`, payments);
    }
  } catch (error) {
    return {
      success: false,
      message: "Error fetching payments.",
      errors: { error}
    };
  }

  return {
    success: true,
    data: processActionReturnData(payments, limitFields) as Payment[]
  };
}

/**
 * Retrieves payments for a specific order.
 *
 * This asynchronous function verifies that the requesting user has permission to read payments from the dashboard.
 * If authorized, it attempts to fetch payments associated with the given order ID from the cache. If the payments
 * are not cached, it queries the database for all payments that belong to the specified order and are not marked as deleted,
 * including related order and user details. The retrieved payments are then processed to remove any fields specified in
 * the `limitFields` parameter before being returned.
 *
 * @param userId - The unique identifier of the user making the request.
 * @param orderId - The unique identifier of the order for which payments are being retrieved.
 * @param limitFields - An array of field names to be excluded from the returned payment objects.
 * @returns A promise that resolves to an object. On success, the object contains a true success flag and the retrieved
 *          payment data; on failure, it contains a false success flag along with an error message and error details.
 *
 * @example
 * const result = await getPaymentsByOrderId({
 *   userId: "user_01",
 *   orderId: "order_123",
 *   limitFields: ["sensitiveInfo", "internalCode"]
 * });
 *
 * if (result.success) {
 *   console.log("Payments data:", result.data);
 * } else {
 *   console.error("Failed to retrieve payments:", result.message);
 * }
 */
export async function getPaymentsByOrderId({ userId, orderId, limitFields }: GetObjectByTParams<'orderId'>): Promise<ActionsReturnType<Payment[]>> {
  if (!await verifyPermission({
    userId: userId,
    permissions: {
      dashboard: { canRead: true },
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to view payments."
    };
  }

  let payments: Payment[] | null = await getCached<Payment[]>(`payments:order:${orderId}`);
  try {
    if (!payments) {
      payments = await prisma.payment.findMany({
        where: {
          orderId,
          isDeleted: false,
        },
        include: {
          order: true,
          user: true,
        }
      });
      await setCached(`payments:order:${orderId}`, payments);
    }
  } catch (error) {
    return {
      success: false,
      message: "Error fetching payments.",
      errors: { error}
    };
  }

  return {
    success: true,
    data: processActionReturnData(payments, limitFields) as Payment[]
  };
}

/**
 * Processes a payment for a specified order.
 *
 * This function verifies that the user has permission to process payments, retrieves the associated order from
 * the database (including its payments and customer details), and calculates the new total paid by summing only the
 * payments with a 'VERIFIED' status along with the new payment amount. If the order exists and the total paid does
 * not exceed the order's total amount, a new payment record is created. The order's payment status is then updated
 * (and, if the order becomes fully paid while initially pending, its status is changed to 'PROCESSING'). The function
 * logs the operation, attempts to send a payment status notification email with relevant order and customer details
 * (logging any email errors without affecting the payment process), and invalidates related caches.
 *
 * @param userId - The ID of the user processing the payment.
 * @param orderId - The ID of the order to which the payment is applied.
 * @param amount - The payment amount.
 * @param paymentMethod - The method used for the payment.
 * @param paymentSite - The site or point from which the payment is processed.
 * @param paymentStatus - The status of the payment (e.g., pending, completed).
 * @param referenceNo - (Optional) A reference number for the payment.
 * @param memo - (Optional) A memo or note for the payment.
 * @param transactionId - (Optional) A unique transaction identifier.
 * @param paymentProvider - (Optional) The provider handling the payment.
 * @param limitFields - (Optional) An array of field names to remove from the returned payment object.
 *
 * @returns A Promise resolving to an object containing:
 *  - success: A boolean indicating whether the payment processing was successful.
 *  - data: The processed Payment object with sensitive fields removed (if `limitFields` is provided) on success.
 *  - message: An error message if the operation fails.
 *  - errors: (Optional) Additional error details.
 *
 * @example
 * const result = await processPayment({
 *   userId: "user123",
 *   orderId: "order456",
 *   amount: 1000,
 *   paymentMethod: PaymentMethod.CREDIT_CARD,
 *   paymentSite: PaymentSite.ONLINE,
 *   paymentStatus: PaymentStatus.COMPLETED,
 *   transactionId: "txn789"
 * });
 *
 * if (result.success) {
 *   console.log("Payment processed:", result.data);
 * } else {
 *   console.error("Payment failed:", result.message);
 * }
 */
export async function processPayment({ 
  userId, 
  orderId,
  amount,
  paymentMethod,
  paymentSite,
  paymentStatus,  
  referenceNo,
  memo,
  transactionId,
  paymentProvider,
  limitFields
}: {
  userId: string;
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentSite: PaymentSite;
  paymentStatus: PaymentStatus;
  referenceNo?: string;
  memo?: string;
  transactionId?: string;
  paymentProvider?: string;
  limitFields?: string[];
}): Promise<ActionsReturnType<Payment>> {
  if (!await verifyPermission({
    userId,
    permissions: {
      dashboard: { canRead: true },
    }
  })) {
    await createLog({
      userId: userId,
      createdById: userId,
      reason: "Payment Processing Failed - Unauthorized",
      systemText: `User attempted to process payment for order ${orderId} but was not authorized`,
      userText: "You are not authorized to process payments."
    });
    return {
      success: false,
      message: "You are not authorized to process payments."
    };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payments: true,
        customer: true
      }
    });

    if (!order) {
      await createLog({
        userId: userId,
        createdById: userId,
        reason: "Payment Processing Failed - Invalid Order",
        systemText: `User attempted to process payment for non-existent order ${orderId}`,
        userText: "Order not found."
      });
      return {
        success: false,
        message: "Order not found."
      };
    }

    const totalPaid = order.payments.filter(payment => payment.paymentStatus === 'VERIFIED').reduce((sum, payment) => sum + Number(payment.amount), 0) + amount;
    if (totalPaid > Number(order.totalAmount)) {
      await createLog({
        userId: order.customerId,
        createdById: userId,
        reason: "Payment Processing Failed - Amount Exceeds Total",
        systemText: `Payment amount ${amount} would exceed order total ${order.totalAmount} for order ${orderId}`,
        userText: "Payment amount exceeds order total."
      });
      return {
        success: false,
        message: "Payment amount exceeds order total."
      };
    }

    const payment = await prisma.payment.create({
      data: {
        orderId,
        userId: order.customerId,
        processedById: userId,
        amount: new Prisma.Decimal(amount),
        paymentMethod,
        paymentSite,
        paymentStatus,
        referenceNo: referenceNo ?? "",
        memo,
        transactionId,
        paymentProvider
      },
      include: {
        order: true,
        user: true
      }
    });

    // Determine if order is fully paid
    const isFullyPaid = totalPaid === Number(order.totalAmount);

    // Update order payment status and order status if fully paid
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        paymentStatus: isFullyPaid ? OrderPaymentStatus.PAID : OrderPaymentStatus.DOWNPAYMENT,
        // Change order status to PROCESSING only if fully paid and current status is PENDING
        ...(isFullyPaid && order.status === 'PENDING' ? { status: 'PROCESSING' } : {})
      }
    });

    // Create success log
    await createLog({
      userId: order.customerId,
      createdById: userId,
      reason: "Payment Processed Successfully",
      systemText: `Payment of ₱${amount} processed for order ${orderId} via ${paymentMethod}. Status: ${paymentStatus}. ${isFullyPaid ? 'Order is now fully paid.' : ''}`,
      userText: `Payment of ₱${amount} has been processed successfully${isFullyPaid ? '. Your order is now fully paid.' : '.'}`
    });

    // Send payment notification email
    try {
      await sendPaymentStatusEmail({
        orderNumber: orderId,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        customerEmail: order.customer.email,
        amount,
        status: 'verified'
      });
    } catch (emailError) {
      await createLog({
        userId: order.customerId,
        createdById: userId,
        reason: "Payment Notification Email Error",
        systemText: `Error sending payment notification email for order ${orderId}: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`,
        userText: "An error occurred while sending the payment notification email."
      });
    }

    // Invalidate caches
    await Promise.all([
      setCached(`payments:order:${orderId}`, null),
      setCached(`order:${orderId}`, null)
    ]);

    return {
      success: true,
      data: processActionReturnData(payment, limitFields) as Payment
    };
  } catch (error) {
    await createLog({
      userId: userId,
      createdById: userId,
      reason: "Payment Processing Error",
      systemText: `Error processing payment for order ${orderId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      userText: "An error occurred while processing the payment."
    });
    
    return {
      success: false,
      message: "Error processing payment.",
      errors: { error }
    };
  }
}

/**
 * Refunds a payment and updates the corresponding order's payment status.
 *
 * This asynchronous function processes a payment refund by first verifying the user's permissions. It retrieves the payment
 * record from the database and ensures that the refund amount does not exceed the original payment amount. If the conditions are met,
 * a refund record is created with a negative amount to indicate the refund. The function then aggregates the remaining payments for the order
 * to determine and update the order's payment status (e.g., marking the order as fully refunded if no payments remain, or as a downpayment otherwise).
 * Additionally, the function logs key events (such as unauthorized access, non-existent payments, invalid amounts, and errors), sends a refund
 * notification email with order and customer details, and invalidates related caches to ensure data integrity.
 *
 * @param userId - The ID of the user initiating the refund.
 * @param paymentId - The unique identifier of the payment to refund.
 * @param amount - The refund amount, which must not exceed the original payment amount.
 * @param reason - The reason for initiating the refund.
 *
 * @returns A Promise that resolves to an object indicating the result of the refund operation. On success, the object contains a `data` property
 * with the newly created refund payment record; on failure, it includes a `message` explaining the error and may also include an `errors` object with additional details.
 */
export async function refundPayment(
  userId: string,
  paymentId: string,
  amount: number,
  reason: string
): Promise<ActionsReturnType<Payment>> {
  if (!await verifyPermission({
    userId,
    permissions: {
      dashboard: { canRead: true },
    }
  })) {
    await createLog({
      userId,
      createdById: userId,
      reason: "Payment Refund Failed - Unauthorized",
      systemText: `Unauthorized attempt to refund payment ${paymentId}`,
      userText: "You are not authorized to process refunds."
    });
    return {
      success: false,
      message: "You are not authorized to process refunds."
    };
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: true,
        user: true
      }
    });

    if (!payment) {
      await createLog({
        userId,
        createdById: userId,
        reason: "Payment Refund Failed - Not Found",
        systemText: `Attempted to refund non-existent payment ${paymentId}`,
        userText: "Payment not found."
      });
      return {
        success: false,
        message: "Payment not found"
      };
    }

    // Check if amount to refund is valid
    if (amount > Number(payment.amount)) {
      await createLog({
        userId: payment.userId,
        createdById: userId,
        reason: "Payment Refund Failed - Invalid Amount",
        systemText: `Attempted to refund ${amount} which exceeds original payment amount ${payment.amount} for payment ${paymentId}`,
        userText: "Refund amount cannot exceed the original payment amount."
      });
      return {
        success: false,
        message: "Refund amount cannot exceed the original payment amount"
      };
    }

    // Create a refund record
    const refund = await prisma.payment.create({
      data: {
        orderId: payment.orderId,
        userId: payment.userId,
        processedById: userId,
        amount: new Prisma.Decimal(-amount), // Negative amount to indicate refund
        paymentMethod: payment.paymentMethod,
        paymentSite: payment.paymentSite,
        paymentStatus: PaymentStatus.REFUNDED,
        referenceNo: payment.referenceNo,
        memo: `Refund for payment ${payment.id}. Reason: ${reason}`,
        transactionId: payment.transactionId,
        paymentProvider: payment.paymentProvider
      },
      include: {
        order: {
          include: {
            customer: {
              select: { 
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        user: true
      }
    });

    // Update order payment status if full refund
    const totalPaidAfterRefund = await prisma.payment.aggregate({
      where: { orderId: payment.orderId },
      _sum: { amount: true }
    });

    const newOrderPaymentStatus = Number(totalPaidAfterRefund._sum.amount) <= 0 
      ? OrderPaymentStatus.REFUNDED 
      : OrderPaymentStatus.DOWNPAYMENT;

    await prisma.order.update({
      where: { id: payment.orderId },
      data: { 
        paymentStatus: newOrderPaymentStatus
      }
    });

    // Create success log
    await createLog({
      userId: payment.userId,
      createdById: userId,
      reason: "Payment Refunded Successfully",
      systemText: `Refunded ₱${amount} from payment ${paymentId} for order ${payment.orderId}. Reason: ${reason}`,
      userText: `Refund of ₱${amount} has been processed successfully. Reason: ${reason}`
    });

    // Send refund notification email
    await sendPaymentStatusEmail({
      orderNumber: refund.order.id,
      customerName: `${refund.order.customer.firstName} ${refund.order.customer.lastName}`,
      customerEmail: refund.order.customer.email,
      amount: Number(refund.amount),
      status: 'refunded',
      refundReason: reason
    });

    // Invalidate caches
    await Promise.all([
      setCached(`payments:order:${payment.orderId}`, null),
      setCached(`order:${payment.orderId}`, null)
    ]);

    return {
      success: true,
      data: processActionReturnData(refund) as Payment
    };
  } catch (error) {
    await createLog({
      userId,
      createdById: userId,
      reason: "Payment Refund Error",
      systemText: `Error refunding payment ${paymentId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      userText: "An error occurred while processing the refund."
    });
    
    return {
      success: false,
      message: "Error processing refund.",
      errors: { error }
    };
  }
}

/**
 * Validates a payment for an order by verifying user permissions, checking for duplicate transactions, creating a payment record, updating the order status, sending a verification email, and invalidating caches.
 *
 * This function performs the following steps:
 * - Verifies that the user has the necessary dashboard read permissions.
 * - Retrieves the order by its identifier and ensures it exists.
 * - Checks for an existing verified payment with the same transaction ID to prevent duplicate processing.
 * - Creates a validated payment record in the database.
 * - Calculates the total paid amount and updates the order's payment status to either PAID (if fully paid) or DOWNPAYMENT.
 * - Logs the outcome for auditing purposes.
 * - Sends a payment verification email to the customer with order and payment details.
 * - Invalidates related cache entries.
 *
 * @param userId - The ID of the user performing the payment validation.
 * @param orderId - The identifier of the order for which the payment is being validated.
 * @param amount - The payment amount to be validated.
 * @param transactionDetails - An object containing payment transaction details:
 *   - transactionId: The unique transaction identifier.
 *   - referenceNo: The payment reference number.
 *   - paymentMethod: The method used for the payment.
 *   - paymentSite: The site where the payment was made.
 *
 * @returns A promise that resolves to an ActionsReturnType object. On success, the object indicates success; on failure, it contains an error message.
 */
export async function validatePayment(
  userId: string,
  orderId: string,
  amount: number,
  transactionDetails: {
    transactionId: string;
    referenceNo: string;
    paymentMethod: PaymentMethod;
    paymentSite: PaymentSite;
  }
): Promise<ActionsReturnType<void>> {
  if (!await verifyPermission({
    userId,
    permissions: {
      dashboard: { canRead: true },
    }
  })) {
    await createLog({
      userId,
      createdById: userId,
      reason: "Payment Validation Failed - Unauthorized",
      systemText: `Unauthorized attempt to validate payment for order ${orderId}`,
      userText: "You are not authorized to validate payments."
    });
    return {
      success: false,
      message: "You are not authorized to validate payments."
    };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payments: true,
        customer: true
      }
    });

    if (!order) {
      await createLog({
        userId,
        createdById: userId,
        reason: "Payment Validation Failed - Order Not Found",
        systemText: `Attempted to validate payment for non-existent order ${orderId}`,
        userText: "Order not found."
      });
      return {
        success: false,
        message: "Order not found."
      };
    }

    // Check for duplicate transaction ID
    const existingPayment = await prisma.payment.findFirst({
      where: {
        transactionId: transactionDetails.transactionId,
        paymentStatus: PaymentStatus.VERIFIED
      }
    });

    if (existingPayment) {
      await createLog({
        userId: order.customerId,
        createdById: userId,
        reason: "Payment Validation Failed - Duplicate Transaction",
        systemText: `Duplicate transaction ID ${transactionDetails.transactionId} detected for order ${orderId}`,
        userText: "This transaction has already been processed."
      });
      return {
        success: false,
        message: "This transaction has already been processed."
      };
    }

    // Create validated payment record
    const verifiedPayment = await prisma.payment.create({
      data: {
        orderId,
        userId: order.customerId,
        processedById: userId,
        amount: new Prisma.Decimal(amount),
        paymentMethod: transactionDetails.paymentMethod,
        paymentSite: transactionDetails.paymentSite,
        paymentStatus: PaymentStatus.VERIFIED,
        transactionId: transactionDetails.transactionId,
        referenceNo: transactionDetails.referenceNo,
        memo: `Payment validated by ${userId}`
      },
      include: {
        order: {
          include: {
            customer: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        }
      }
    });

    // Update order status if needed
    const totalPaid = order.payments.reduce((sum, payment) => sum + Number(payment.amount), 0) + amount;
    if (totalPaid >= Number(order.totalAmount)) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: OrderPaymentStatus.PAID,
          status: order.status === OrderStatus.PENDING ? OrderStatus.PROCESSING : order.status
        },
      });
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: OrderPaymentStatus.DOWNPAYMENT
        }
      });
    }

    // Create success log
    await createLog({
      userId: order.customerId,
      createdById: userId,
      reason: "Payment Validated Successfully",
      systemText: `Validated payment of ₱${amount} for order ${orderId}. Transaction ID: ${transactionDetails.transactionId}`,
      userText: "Payment has been validated successfully."
    });

    // Send payment verification email
    await sendPaymentStatusEmail({
      orderNumber: verifiedPayment.order.id,
      customerName: `${verifiedPayment.order.customer.firstName} ${verifiedPayment.order.customer.lastName}`,
      customerEmail: verifiedPayment.order.customer.email,
      amount: Number(verifiedPayment.amount),
      status: 'verified'
    });

    // Invalidate caches
    await Promise.all([
      setCached(`payments:order:${orderId}`, null),
      setCached(`order:${orderId}`, null)
    ]);

    return {
      success: true
    };
  } catch (error) {
    await createLog({
      userId,
      createdById: userId,
      reason: "Payment Validation Error",
      systemText: `Error validating payment for order ${orderId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      userText: "An error occurred while validating the payment."
    });

    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to validate payment"
    };
  }
}

/**
 * Rejects a payment for a specified order by updating the payment's status to "DECLINED" and logging the rejection.
 *
 * This function first verifies that the user has the necessary permissions to reject payments. It then attempts
 * to find the associated order. If the order exists, it updates an existing payment record or creates a new one
 * with a "DECLINED" status and a memo containing the rejection reason. The function logs the rejection action,
 * invalidates cache entries related to the order and its payments, and returns a success status. In case of a 
 * permission failure, an order not found, or any other error, it logs the error and returns a failure status with
 * an appropriate message.
 *
 * @param userId - ID of the user initiating the rejection.
 * @param orderId - ID of the order associated with the payment.
 * @param paymentId - ID of the payment to be rejected.
 * @param rejectionReason - Explanation for why the payment is being rejected.
 *
 * @returns A promise resolving to an object indicating the success status and an optional error message.
 *
 * @example
 * const result = await rejectPayment("user123", "order456", "payment789", "Payment method declined by bank");
 * if (!result.success) {
 *   console.error(result.message);
 * }
 */
export async function rejectPayment(
  userId: string,
  orderId: string,
  paymentId: string,
  rejectionReason: string
): Promise<ActionsReturnType<void>> {
  if (!await verifyPermission({
    userId,
    permissions: {
      dashboard: { canRead: true },
    }
  })) {
    await createLog({
      userId,
      createdById: userId,
      reason: "Payment Rejection Failed - Unauthorized",
      systemText: `Unauthorized attempt to reject payment for order ${orderId}`,
      userText: "You are not authorized to reject payments."
    });
    return {
      success: false,
      message: "You are not authorized to reject payments."
    };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true
      }
    });

    if (!order) {
      await createLog({
        userId,
        createdById: userId,
        reason: "Payment Rejection Failed - Order Not Found",
        systemText: `Attempted to reject payment for non-existent order ${orderId}`,
        userText: "Order not found."
      });
      return {
        success: false,
        message: "Order not found."
      };
    }

    // Update or create payment record with rejected status
    await prisma.payment.upsert({
      where: {
        id: paymentId
      },
      update: {
        paymentStatus: PaymentStatus.DECLINED,
        memo: `Payment rejected: ${rejectionReason}`
      },
      create: {
        orderId,
        userId: order.customerId,
        processedById: userId,
        amount: new Prisma.Decimal(0),
        paymentMethod: PaymentMethod.OTHERS,
        paymentSite: PaymentSite.OFFSITE,
        paymentStatus: PaymentStatus.DECLINED,
        memo: `Payment rejected: ${rejectionReason}`
      }
    });

    // Create rejection log
    await createLog({
      userId: order.customerId,
      createdById: userId,
      reason: "Payment Rejected",
      systemText: `Rejected payment for order ${orderId}. Payment ID: ${paymentId}. Reason: ${rejectionReason}`,
      userText: `Payment has been rejected. Reason: ${rejectionReason}`
    });

    // Invalidate caches
    await Promise.all([
      setCached(`payments:order:${orderId}`, null),
      setCached(`order:${orderId}`, null)
    ]);

    return {
      success: true
    };
  } catch (error) {
    await createLog({
      userId,
      createdById: userId,
      reason: "Payment Rejection Error",
      systemText: `Error rejecting payment for order ${orderId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      userText: "An error occurred while rejecting the payment."
    });

    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to reject payment"
    };
  }
}