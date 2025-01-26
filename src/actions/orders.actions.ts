'use server';

import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { ExtendedOrder } from "@/types/orders";

export async function getAllOrders(userId: string): Promise<ActionsReturnType<ExtendedOrder[]>> {
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


  const orders = await prisma.order.findMany({
    where: {
      isDeleted: false
    },
    include: {
      payments: true,
      customer: true,
    }
  });


  return {
    success: true,
    data: JSON.parse(JSON.stringify(orders))
  };
}