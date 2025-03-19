'use server';

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { ExtendedOrder } from "@/types/orders";
import { getCached, setCached } from "@/lib/redis";
import { QueryParams, PaginatedResponse } from "@/types/common";
import { GetObjectByTParams } from "@/types/extended";
import { createOrderSchema, CreateOrderType } from "@/schema/orders.schema";
import { sendOrderConfirmationEmail } from "@/lib/email-service";
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

  // Create cache key that includes the where conditions
  const cacheKey = `orders:${page}:${take}:${JSON.stringify(params)}`;
  let orders: ExtendedOrder[] | null = await getCached(cacheKey);
  let total = await getCached(`orders:total:${JSON.stringify(params)}`);

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

    let order = await getCached(`order:${orderId}`);
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

      await setCached(`order:${orderId}`, order);
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

    // Send order confirmation email
    await sendOrderConfirmationEmail({
      // @ts-expect-error - Prisma types are incorrect
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
      data: processActionReturnData(order) as CreateOrderType
    };

  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while creating the order"
    };
  }
}

export async function updateOrder(params: {
  userId: string;
  orderId: string;
  status?: "PENDING" | "PROCESSING" | "READY" | "DELIVERED" | "CANCELLED";
  paymentStatus?: "PENDING" | "DOWNPAYMENT" | "PAID" | "REFUNDED";
  cancellationReason?: "OUT_OF_STOCK" | "CUSTOMER_REQUEST" | "PAYMENT_FAILED" | "OTHERS";
  estimatedDelivery?: Date;
}): Promise<ActionsReturnType<ExtendedOrder>> {
  const isAuthorized = await verifyPermission({
    userId: params.userId,
    permissions: {
      orders: { canUpdate: true }
    }
  });

  if (!isAuthorized) {
    return {
      success: false,
      message: "You do not have permission to update orders."
    };
  }

  try {
    const order = await prisma.order.update({
      where: { id: params.orderId },
      data: {
        status: params.status,
        paymentStatus: params.paymentStatus,
        cancellationReason: params.cancellationReason,
        estimatedDelivery: params.estimatedDelivery
      },
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

    // Generate survey when order is marked as delivered
    if (params.status === "DELIVERED") {
      // Check if a survey already exists for this order
      const existingSurvey = await prisma.customerSatisfactionSurvey.findUnique({
        where: { orderId: params.orderId }
      });

      if (!existingSurvey) {
        const defaultCategory = await prisma.surveyCategory.findFirst({
          where: { isDeleted: false }
        });

        if (defaultCategory) {
          await prisma.customerSatisfactionSurvey.create({
            data: {
              orderId: params.orderId,
              categoryId: defaultCategory.id,
              answers: {}
            }
          });
        }
      }
    }

    revalidatePath('/admin/orders');
    
    return {
      success: true,
      data: processActionReturnData(order) as ExtendedOrder
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update order"
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
  const cacheKey = `pending-payment-orders:${page}:${take}`;

  try {
    let orders = await getCached(cacheKey);
    let total = await getCached('pending-payment-orders:total');

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

      await Promise.all([
        setCached(cacheKey, orders),
        setCached('pending-payment-orders:total', total)
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
