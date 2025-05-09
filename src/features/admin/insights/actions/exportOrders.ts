'use server';

import { arrayToCSV, processExportData, type ExportParams, type ExportItem } from './_helpers';
import prisma from '@/lib/db';

export async function exportOrders({ startDate, endDate }: ExportParams) {
  const dateFilter = {
    ...(startDate && { gte: new Date(startDate) }),
    ...(endDate && { lte: new Date(endDate) }),
  };

  const orders = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        isDeleted: false,
      },
    },
    include: {
      order: {
        include: {
          customer: true,
          // Ensure payments are included if processExportData needs them for general orders
          payments: true, 
        }
      },
      variant: {
        include: {
          product: true,
        }
      },
    },
  });

  // The prisma result for orderItem needs to be cast to ExportItem for processExportData
  const exportData = orders.map(item => processExportData(item as unknown as ExportItem));

  return arrayToCSV(exportData);
} 