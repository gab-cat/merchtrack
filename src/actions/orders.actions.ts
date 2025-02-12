'use server';

import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { ExtendedOrder } from "@/types/orders";
import { getCached, setCached } from "@/lib/redis";
import { QueryParams, PaginatedResponse } from "@/types/common";
import { calculatePagination, removeFields } from "@/utils/query.utils";
import { GetObjectByTParams } from "@/types/extended";

/**
 * Retrieves a paginated list of orders with optional field filtering.
 *
 * This asynchronous function fetches order data for the specified user after
 * verifying that the user has permission to access the dashboard. It calculates
 * pagination parameters using the provided query parameters, attempts to fetch
 * cached orders and the total order count, and if the data is not cached, queries
 * the database while including associated payment and customer details.
 *
 * Order data is processed with the `removeFields` utility to filter out specified
 * fields based on `params.limitFields`. The response includes the order data along
 * with pagination metadata such as total count, current page, last page, and
 * indicators for next and previous pages.
 *
 * @param userId - The ID of the user requesting the orders.
 * @param params - Optional query parameters for pagination and field filtering.
 * @returns A Promise that resolves to an object indicating the success status,
 *          and on success, includes a paginated response containing the list of processed orders and metadata.
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

  let orders: ExtendedOrder[] | null = await getCached(`orders:${page}:${take}`);
  let total = await getCached('orders:total');

  if (!orders) {
    [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where: { isDeleted: false },
        include: { payments: true, customer: true },
        skip,
        take,
      }),
      prisma.order.count({ where: { isDeleted: false } })
    ]);

    await setCached(`orders:${page}:${take}`, orders);
    await setCached('orders:total', total);
  }

  const lastPage = Math.ceil(total as number / take);
  const processedOrders = orders.map(order => 
    removeFields(order, params.limitFields)
  );

  return {
    success: true,
    data: {
      data: JSON.parse(JSON.stringify(processedOrders)),
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
 * Retrieves an order by its ID after verifying user permissions and applying field filtering.
 *
 * This function first checks if the user identified by `userId` has read access to the dashboard.
 * If the authorization check fails, it immediately returns a failure response. Otherwise, it attempts
 * to load the order data from the cache using the key `orders:${orderId}`. If the order is not found in
 * the cache, it queries the database for the order, including related `payments` and `customer` data.
 * If no order is found, a failure message is returned. Upon successfully retrieving the order, it caches
 * the order data and processes it through a field-limiting utility before returning the sanitized result.
 *
 * @param param0 - Object containing the following properties:
 *   - userId: The unique identifier of the user requesting the order.
 *   - orderId: The unique identifier of the order to retrieve.
 *   - limitFields: Array of field names to be excluded from the returned order data.
 * @returns A promise that resolves to an object with:
 *   - success: Boolean indicating whether the operation was successful.
 *   - data: The order data with specified fields removed, if successful.
 *   - message: A failure message if the user is unauthorized or the order is not found.
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
export async function getOrderById({userId, orderId, limitFields}: GetObjectByTParams<'orderId'>): Promise<ActionsReturnType<ExtendedOrder>> {
  const isAuthorized = await verifyPermission({
    userId: userId,
    permissions: {
      dashboard: { canRead: true },
    }
  });

  if (!isAuthorized) {
    return {
      success: false,
      message: "You are not authorized to view orders."
    };
  }

  let order: ExtendedOrder | null = await getCached(`orders:${orderId}`);
  if (!order) {
    order = await prisma.order.findFirst({
      where: {
        id: orderId
      },
      include: {
        payments: true,
        customer: true,
      }
    });

    if (!order) {
      return {
        success: false,
        message: "Order not found."
      };
    }

    await setCached(`orders:${orderId}`, order);
  }

  return {
    success: true,
    data: JSON.parse(JSON.stringify(removeFields(order, limitFields)))
  };
}