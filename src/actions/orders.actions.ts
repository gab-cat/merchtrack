'use server';

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { ExtendedOrder } from "@/types/orders";
import { getCached, setCached } from "@/lib/redis";
import { QueryParams, PaginatedResponse } from "@/types/common";
import { calculatePagination, removeFields } from "@/utils/query.utils";
import { GetObjectByTParams } from "@/types/extended";
import { createOrderSchema, CreateOrderType } from "@/schema/orders.schema";
import { sendOrderConfirmationEmail } from "@/lib/email-service";

/**
 * Retrieves a paginated list of orders with optional field filtering.
 *
 * This asynchronous function fetches order data for the specified user after verifying
 * that the user has permission to access the dashboard. It calculates pagination parameters
 * (skip, take, page) based on the provided query parameters and attempts to obtain cached
 * orders and the total order count. In case of a cache miss, it performs a database transaction
 * to fetch orders along with associated payment, customer, and order item details (including
 * nested variant and product information).
 *
 * The retrieved orders are processed with the `removeFields` utility to filter out specified
 * fields based on `params.limitFields`. The function returns a paginated response containing the
 * list of processed orders and metadata including total number of orders, current page, last page,
 * and flags indicating the availability of next and previous pages.
 *
 * If the user lacks the necessary permissions, a failure response with an appropriate message is returned.
 *
 * @param userId - The ID of the user requesting the orders.
 * @param params - Optional query parameters for pagination, filtering, and inclusion of related data.
 * @returns A Promise that resolves to an object with a `success` property. On success, the object contains
 *          a `data` field with the paginated list of orders and corresponding metadata.
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

  // Create cache key that includes the where conditions
  const cacheKey = `orders:${page}:${take}:${JSON.stringify(params)}`;
  let orders: ExtendedOrder[] | null = await getCached(cacheKey);
  let total = await getCached(`orders:total:${JSON.stringify(params)}`);

  if (!orders || !total) {
    [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where: params.where,
        include: {
          ...params.include,
          customer: true,
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
        },
        orderBy: params.orderBy,
        skip,
        take,
      }),
      prisma.order.count({ where: params.where })
    ]);

    await setCached(cacheKey, orders);
    await setCached(`orders:total:${JSON.stringify(params)}`, total);
  }


  if (!orders) {
    return {
      success: false,
      message: "No orders found."
    };
  }

  const lastPage = Math.ceil(total as number / take);
  const processedOrders = orders?.map(order => 
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

export async function getOrderById({ userId, orderId, limitFields }: GetObjectByTParams<"orderId">): Promise<ActionsReturnType<ExtendedOrder | null>> {
  try {
    const hasPermission = await verifyPermission({
      userId,
      permissions: {
        orders: { canRead: true }
      }
    });

    if (!hasPermission) {
      return {
        success: false,
        message: "You do not have permission to view orders."
      };
    }

    let order = await getCached(`order:${orderId}`);
    if (!order) {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          customer: true,
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

      await setCached(`order:${orderId}`, order);
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(removeFields(order as ExtendedOrder, limitFields)))
    };
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return {
      success: false,
      message: (error as Error).message
    };
  }
}

/**
 * Creates a new order after validating the input data and verifying user permissions.
 *
 * This function first checks if the user identified by `userId` has permission to create orders.
 * If the authorization check fails, it immediately returns a failure response. Otherwise, it validates
 * the input data against the `createOrderSchema` and attempts to create a new order in the database.
 * The newly created order is then cached, and the total order count is updated in the cache.
 * The cache for the orders list is invalidated to ensure the new order is included in subsequent queries.
 *
 * @param userId - The unique identifier of the user creating the order.
 * @param data - The input data for the new order, which will be validated against the `createOrderSchema`.
 * @returns A promise that resolves to an object with:
 *   - success: Boolean indicating whether the operation was successful.
 *   - data: The newly created order data, if successful.
 *   - message: A failure message if the user is unauthorized or the input data is invalid.
 *
 * @example
 * ```typescript
 * const result = await createOrder('user123', {
 *   customerId: 'customer456',
 *   processedById: 'user123',
 *   totalAmount: 100,
 *   discountAmount: 10,
 *   estimatedDelivery: new Date(),
 *   orderItems: [
 *     { variantId: 'variant789', quantity: 2, customerNote: 'Please deliver ASAP', size: 'M' }
 *   ]
 * });
 *
 * if (result.success) {
 *   console.log('Order created:', result.data);
 * } else {
 *   console.error('Error:', result.message);
 * }
 * ```
 */
export async function createOrder(userId: string, data: CreateOrderType): Promise<ActionsReturnType<CreateOrderType>> {
  if (!await verifyPermission({
    userId,
    permissions: {
      dashboard: { canRead: true }
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

    // Send order confirmation email
    await sendOrderConfirmationEmail({
      order,
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      customerEmail: order.customer.email
    });

    // Invalidate cache
    await Promise.all([
      setCached(`order:${order.id}`, order),
      getCached('orders:total').then(total => 
        setCached('orders:total', (typeof total === 'number' ? total : 0) + 1)
      )
    ]);

    revalidatePath('/admin/orders');
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(order))
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message
    };
  }
}
