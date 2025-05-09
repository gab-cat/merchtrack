'use server';

import { arrayToCSV, type ExportParams } from './_helpers'; // Only ExportParams and arrayToCSV are needed from helpers
import prisma from '@/lib/db';

export async function exportProducts({ startDate, endDate }: ExportParams) {
  const dateFilter = {
    ...(startDate && { gte: new Date(startDate) }),
    ...(endDate && { lte: new Date(endDate) }),
  };

  const variants = await prisma.productVariant.findMany({
    include: {
      product: true,
      OrderItem: {
        where: {
          order: {
            createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
            isDeleted: false,
          },
        },
      },
    },
  });

  const exportData = variants.map(variant => {
    const totalOrdered = variant.OrderItem.reduce((sum: number, item) => sum + item.quantity, 0);
    const totalRevenue = variant.OrderItem.reduce((sum: number, item) => sum + (Number(item.price) * item.quantity), 0);

    return {
      productId: variant.productId,
      productName: variant.product.title,
      variantId: variant.id,
      variantName: variant.variantName,
      currentInventory: variant.inventory,
      totalOrdered: totalOrdered,
      totalRevenue: totalRevenue,
      averagePricePerUnit: totalOrdered > 0 ? totalRevenue / totalOrdered : 0,
      // Add more product-specific fields as needed
    };
  });

  return arrayToCSV(exportData);
} 