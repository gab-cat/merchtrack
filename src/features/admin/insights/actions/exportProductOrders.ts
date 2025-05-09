'use server';

import { arrayToCSV, processExportData, type ExportParams, type ExportItem } from './_helpers';
import prisma from '@/lib/db';

export async function exportProductOrders({ startDate, endDate, productId }: ExportParams) {
  if (!productId) {
    throw new Error('Product ID is required');
  }

  const dateFilter = {
    ...(startDate && { gte: new Date(startDate) }),
    ...(endDate && { lte: new Date(endDate) }),
  };

  const orders = await prisma.orderItem.findMany({
    where: {
      variant: {
        product: {
          id: productId
        }
      },
      order: {
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        isDeleted: false,
      },
    },
    include: {
      order: {
        include: {
          customer: true,
          payments: true,
        }
      },
      variant: {
        include: {
          product: true,
        },
      },
    },
  });
  // The prisma result for orderItem needs to be cast to ExportItem for processExportData
  const exportData = orders.map(item => processExportData(item as unknown as ExportItem));

  return arrayToCSV(exportData);
} 