'use server';

import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { ExtendedOrder } from "@/types/orders";
import { getCached, setCached } from "@/lib/redis";
import { QueryParams, PaginatedResponse } from "@/types/common";
import { calculatePagination, removeFields } from "@/utils/query.utils";
import { GetObjectByTParams } from "@/types/extended";

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