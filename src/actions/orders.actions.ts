'use server';

import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { ExtendedOrder } from "@/types/orders";
import { getCached, setCached} from "@/lib/redis";

export async function getOrders(userId: string): Promise<ActionsReturnType<ExtendedOrder[]>> {
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

  let orders: ExtendedOrder[] | null = await getCached('orders:all');
  if (!orders || orders.length === 0) {
    orders = await prisma.order.findMany({
      where: {
        isDeleted: false
      },
      include: {
        payments: true,
        customer: true,
      }
    });

    await setCached('orders', orders);
  }


  return {
    success: true,
    data: JSON.parse(JSON.stringify(orders))
  };
}

export async function getOrderById(userId: string, orderId: string): Promise<ActionsReturnType<ExtendedOrder>> {
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
    data: JSON.parse(JSON.stringify(order))
  };
}