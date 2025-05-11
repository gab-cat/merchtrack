'use server';

import { Payment, User } from "@prisma/client";
import prisma from "@/lib/db";
import { QueryParams, PaginatedResponse } from "@/types/common";
import { GetObjectByTParams } from "@/types/extended";
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
): Promise<ActionsReturnType<PaginatedResponse<(Payment & { user: User })[]>>> {
  const isAuthorized = await verifyPermission({
    userId: userId,
    permissions: {
      payments: { canRead: true },
    }
  });

  const { skip, take, page } = calculatePagination(params);

  try {
    let payments: Payment[] | null = null;
    let total = null;

    if (!payments || !total) {
      [payments, total] = await prisma.$transaction([
        prisma.payment.findMany({
          where: isAuthorized ? { ...params.where } : { userId },
          include: {
            order: true,
            user: true,
          },
          orderBy: params.orderBy,
          skip,
          take
        }),
        prisma.payment.count({ where: isAuthorized ? { ...params.where } : { userId } })
      ]);
    }

    const lastPage = Math.ceil(total / take);

    return {
      success: true,
      data: {
        data: processActionReturnData(payments, params.limitFields) as (Payment & { user: User })[],
        metadata: {
          total: total,
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
      payments: { canRead: true },
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to view payments."
    };
  }

  let payment: Payment | null = null;
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
      payments: { canRead: true },
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to view payments."
    };
  }

  let payments: Payment[] | null = null;
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
      payments: { canRead: true },
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to view payments."
    };
  }

  let payments: Payment[] | null = null;
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