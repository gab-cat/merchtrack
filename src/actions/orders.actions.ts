'use server';

import prisma from "@/lib/db";
import { ExtendedOrder } from "@/types/orders";
import { QueryParams, PaginatedResponse } from "@/types/common";
import { GetObjectByTParams } from "@/types/extended";
import { verifyPermission, calculatePagination, processActionReturnData } from "@/utils";


/**
 * Retrieves a paginated list of orders with optional field filtering.
 *
 * This asynchronous function fetches a paginated list of orders for a specified user after verifying
 * that the user has permission to access the dashboard. It calculates pagination parameters (skip, take, page)
 * based on the provided query parameters. The function first attempts to retrieve orders and the total count
 * from cache; if the cache is missing these values, it performs a Prisma database transaction to fetch the orders
 * along with related details (including customer, payments, and order items with nested variant and product data).
 *
 * The resulting orders are processed using the `removeFields` utility to filter out fields as specified in
 * `params.limitFields`, and pagination metadata is computed (total orders, current page, last page, and flags for
 * the availability of next and previous pages). If no orders are found or if the user lacks the required permissions,
 * the function returns a failure response with an appropriate message.
 *
 * @param userId - The ID of the user requesting orders.
 * @param params - Optional query parameters for filtering, pagination, inclusion of related data, and field removal.
 * @returns A Promise that resolves to an object indicating success. On success, the object contains a `data` field
 *          with the processed list of orders and pagination metadata; on failure, an error message is provided.
 *
 * @example
 * ```typescript
 * const response = await getOrders('user123', { page: 2, limitFields: ['id', 'customer'] });
 * if (response.success) {
 *   console.log(response.data.data); // Processed list of orders
 *   console.log(response.data.metadata); // Pagination metadata
 * } else {
 *   console.error(response.message);
 * }
 * ```
 */
export async function getOrders(
  userId: string,
  params: QueryParams = {}
): Promise<ActionsReturnType<PaginatedResponse<ExtendedOrder[]>>> {
  const isAuthorized = await verifyPermission({
    userId: userId,
    permissions: {
      orders: { canRead: true },
    }
  });


  const { skip, take, page } = calculatePagination(params);

  let orders: ExtendedOrder[] | null = null;
  let total = null;

  if (!orders || !total) {
    // @ts-expect-error - Prisma types are incorrect
    [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where: isAuthorized ? params.where : { customerId: userId },
        include: {
          ...params.include,
          customer: true,
          payments: true,
          customerSatisfactionSurvey: true,
          orderItems: {
            include: {
              variant: {
                include: {
                  product: true
                }
              }
            }
          }
        },
        orderBy: params.orderBy,
        skip,
        take,
      }),
      prisma.order.count({ where: params.where })
    ]);
  }


  if (!orders) {
    return {
      success: false,
      message: "No orders found."
    };
  }

  const lastPage = Math.ceil(total as number / take);

  return {
    success: true,
    data: {
      data: processActionReturnData(orders, params.limitFields) as ExtendedOrder[],
      metadata: {
        total: total as number,
        page,
        lastPage,
        hasNextPage: page < lastPage,
        hasPrevPage: page > 1
      }
    }
  };
}

/**
 * Retrieves an order by its ID after verifying that the user has permission to view orders
 * and applying field filtering to the returned data.
 *
 * This function first verifies that the user, identified by `userId`, has the necessary read access
 * to orders. If the permission check fails, it returns a failure response immediately. It then attempts
 * to load the order data from the cache using the key `order:${orderId}`. If the order is not found in
 * the cache, the function queries the database for the order, including related customer, processedBy,
 * payments, and detailed order items data. In the event that no order is found, a failure message is returned.
 *
 * Upon retrieving the order, the function caches the order data, applies a field-limiting utility to remove
 * any fields specified in `limitFields`, and returns the sanitized order data.
 *
 * @param param0 - Object containing the following properties:
 *   - userId: The unique identifier of the user requesting the order.
 *   - orderId: The unique identifier of the order to retrieve.
 *   - limitFields: An array of field names to be excluded from the returned order data.
 * @returns A promise that resolves to an object with:
 *   - success: A boolean indicating whether the operation was successful.
 *   - data: The order data with specified fields removed if the operation is successful.
 *   - message: A failure message if the user lacks permission, the order is not found, or an error occurs.
 *
 * @example
 * ```typescript
 * const result = await getOrderById({
 *   userId: 'user123',
 *   orderId: 'order456',
 *   limitFields: ['internalNotes', 'costPrice']
 * });
 *
 * if (result.success) {
 *   console.log('Order:', result.data);
 * } else {
 *   console.error('Error:', result.message);
 * }
 * ```
 */

export async function getOrderById({ userId, orderId, limitFields }: GetObjectByTParams<"orderId">): Promise<ActionsReturnType<ExtendedOrder | null>> {
  try {
    const isAuthorized = await verifyPermission({
      userId,
      permissions: {
        orders: { canRead: true }
      }
    });

    let order = null;
    if (!order) {
      order = await prisma.order.findUnique({
        where: isAuthorized ? { id: orderId } : { id: orderId, customerId: userId },
        include: {
          customer: true,
          customerSatisfactionSurvey: true,
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

      if (!order) {
        return {
          success: false,
          message: "Order not found"
        };
      }
    }

    return {
      success: true,
      data: processActionReturnData(order, limitFields) as ExtendedOrder
    };
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return {
      success: false,
      message: (error as Error).message
    };
  }
}

type PendingOrdersResponse = PaginatedResponse<ExtendedOrder[]>;

/**
 * Retrieves orders with pending or downpayment status for payment reminders.
 * 
 * @param userId - The ID of the user requesting the orders
 * @param params - Query parameters for pagination
 * @returns Promise with paginated orders that need payment reminders
 */
export async function getPendingPaymentOrders(
  userId: string,
  params: QueryParams = {}
): Promise<ActionsReturnType<PendingOrdersResponse>> {
  const isAuthorized = await verifyPermission({
    userId,
    permissions: {
      orders: { canRead: true },
      dashboard: { canRead: true },
    }
  });

  if (!isAuthorized) {
    return {
      success: false,
      message: "You are not authorized to view orders."
    };
  }

  const { skip, take, page } = calculatePagination(params);

  try {
    let orders = null;
    let total = null;

    if (!orders || !total) {
      [orders, total] = await prisma.$transaction([
        prisma.order.findMany({
          where: {
            paymentStatus: {
              in: ['PENDING', 'DOWNPAYMENT']
            },
            status: {
              not: 'CANCELLED'
            }
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
                    product: {
                      select: {
                        title: true
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take
        }),
        prisma.order.count({
          where: {
            paymentStatus: {
              in: ['PENDING', 'DOWNPAYMENT']
            },
            status: {
              not: 'CANCELLED'
            }
          }
        })
      ]);
    }

    const lastPage = Math.ceil(total as number / take);

    return {
      success: true,
      data: {
        data: processActionReturnData(orders, params.limitFields) as ExtendedOrder[],
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
      message: "Error fetching pending payment orders.",
      errors: { error }
    };
  }
}
