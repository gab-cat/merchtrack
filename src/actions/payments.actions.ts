'use server';

import { Payment } from "@prisma/client";
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { getCached, setCached } from "@/lib/redis";
import { QueryParams, PaginatedResponse } from "@/types/common";
import { calculatePagination, removeFields } from "@/utils/query.utils";
import { GetObjectByTParams } from "@/types/extended";

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
          where: { isDeleted: false },
          include: {
            order: true,
            user: true,
          },
          skip,
          take
        }),
        prisma.payment.count({ where: { isDeleted: false } })
      ]);
      
      await setCached(`payments:${page}:${take}`, payments);
      await setCached('payments:total', total);
    }

    const lastPage = Math.ceil(total as number / take);
    const processedPayments = payments.map(payment => 
      removeFields(payment, params.limitFields)
    );

    return {
      success: true,
      data: {
        data: JSON.parse(JSON.stringify(processedPayments)),
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
    if (payment) {
      payment = await prisma.payment.findFirst({
        where: {
          id: paymentId,
          isDeleted: false,
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
    data: JSON.parse(JSON.stringify(removeFields(payment, limitFields)))
  };
}

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

  const processedPayments = payments.map(payment =>
    removeFields(payment, limitFields)
  );

  return {
    success: true,
    data: JSON.parse(JSON.stringify(processedPayments))
  };
}

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

  const processedPayments = payments.map(payment =>
    removeFields(payment, limitFields)
  );

  return {
    success: true,
    data: JSON.parse(JSON.stringify(processedPayments))
  };
}