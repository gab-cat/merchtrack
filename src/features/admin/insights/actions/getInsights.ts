'use server';

import { OrderStatus, Product, ProductVariant, OrderItem, Order as PrismaOrder, Category as PrismaCategory, Prisma } from '@prisma/client';
import prisma from '@/lib/db';
import { verifyPermission } from '@/utils/permissions';
import { InsightsData } from '@/hooks/use-insights';
import { processActionReturnData } from '@/utils';

// Types specific to getInsights or its helpers
interface DailyStats {
  date: string;
  totalCollected: number;
  totalOrders: number;
}

interface SurveyMetric {
  categoryName: string;
  totalScore: number;
  count: number;
  avgScore: number;
}

interface SaleData {
  createdAt: Date;
  totalAmount: number | string;
}

// Helper functions specific to getInsights
function calculateCollectionMetrics(salesData: SaleData[], totalPayableAmount: number): Array<{date: string, collectionRate: number}> {
  const dailyStats = salesData.reduce<DailyStats[]>((acc, sale) => {
    const date = new Date(sale.createdAt);
    const dateKey = date.toISOString().split('T')[0];
    
    const existingDay = acc.find(d => d.date === dateKey);
    if (existingDay) {
      existingDay.totalCollected += Number(sale.totalAmount);
      existingDay.totalOrders += 1;
    } else {
      acc.push({
        date: dateKey,
        totalCollected: Number(sale.totalAmount),
        totalOrders: 1,
      });
    }
    return acc;
  }, []);

  return dailyStats.map(day => ({
    date: day.date,
    collectionRate: totalPayableAmount > 0 ? (day.totalCollected / totalPayableAmount) * 100 : 0,
  }));
}

function processSurveyMetrics(surveyData: Prisma.CustomerSatisfactionSurveyGetPayload<{include: {category: true}}>[]): SurveyMetric[] {
  const surveyMetrics = surveyData.reduce<Record<string, SurveyMetric>>((acc, survey) => {
    const answers = survey.answers as Record<string, number> ?? {};
    const values = Object.values(answers);
    const avgScore = values.length > 0 ? values.reduce((sum, score) => sum + score, 0) / values.length : 0;
    
    const categoryId = survey.categoryId;
    if (!acc[categoryId]) {
      acc[categoryId] = {
        categoryName: survey.category.name,
        totalScore: avgScore,
        count: 1,
        avgScore: avgScore,
      };
    } else {
      acc[categoryId].totalScore += avgScore;
      acc[categoryId].count += 1;
      acc[categoryId].avgScore = acc[categoryId].totalScore / acc[categoryId].count;
    }
    return acc;
  }, {});

  return Object.values(surveyMetrics);
}

// Define a more specific type for product data included in the transaction
type ProductDataForInsights = Product & {
  category: PrismaCategory | null;
  variants: (ProductVariant & {
    OrderItem: (OrderItem & {
      order: PrismaOrder;
    })[];
  })[];
};

export async function getInsights(
  userId: string,
  params: { startDate?: string; endDate?: string }
): ActionsReturnType<InsightsData> {
  if (!await verifyPermission({ 
    userId, 
    permissions: { reports: { canRead: true } } 
  })) {
    return { success: false, message: "Permission denied" };
  }

  const { startDate, endDate } = params;
  const dateFilter: { gte?: Date; lte?: Date } = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) dateFilter.lte = new Date(endDate);

  try {
    const transactionPromises = [
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: dateFilter, status: OrderStatus.DELIVERED, isDeleted: false },
      }),
      prisma.order.count({
        where: { createdAt: dateFilter, isDeleted: false },
      }),
      prisma.user.count({
        where: { createdAt: dateFilter, orders: { some: {} } },
      }),
      prisma.product.findMany({
        where: {
          isDeleted: false,
          variants: {
            some: {
              OrderItem: {
                some: {
                  order: {
                    createdAt: dateFilter,
                    isDeleted: false,
                  },
                },
              },
            },
          },
        },
        include: {
          variants: {
            include: {
              OrderItem: {
                include: {
                  order: true,
                },
              },
            },
          },
          category: true,
        },
      }),
      prisma.order.findMany({
        where: {
          createdAt: dateFilter,
          status: OrderStatus.DELIVERED,
          isDeleted: false,
        },
        select: {
          createdAt: true,
          totalAmount: true,
        },
      }),
      prisma.customerSatisfactionSurvey.findMany({
        where: {
          createdAt: dateFilter,
          metadata: {
            path: ['isSubmitted'],
            equals: true,
          },
        },
        include: {
          category: true,
        },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          createdAt: dateFilter,
          isDeleted: false,
          status: { notIn: [OrderStatus.CANCELLED /*, OrderStatus.REFUNDED */] }, 
        },
      }),
    ] as const;
    
    const [totalRevenueRes, totalOrders, totalCustomers, productsData, salesData, surveyData, totalPayableRes]: [
      Prisma.GetOrderAggregateType<{_sum: {totalAmount: true}}>,
      number,
      number,
      ProductDataForInsights[],
      SaleData[],
      Prisma.CustomerSatisfactionSurveyGetPayload<{include: {category: true}}>[],
      Prisma.GetOrderAggregateType<{_sum: {totalAmount: true}}>
    ] = await prisma.$transaction([...transactionPromises]);

    const collectionRateMetrics = calculateCollectionMetrics(salesData, Number(totalPayableRes._sum.totalAmount) || 0);
    const surveyResultMetrics = processSurveyMetrics(surveyData);

    const totalCollectedOverPeriod = salesData.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const overallTotalPayableAmount = Number(totalPayableRes._sum.totalAmount) || 0;
    const overallCollectionRate = overallTotalPayableAmount > 0 ? (totalCollectedOverPeriod / overallTotalPayableAmount) * 100 : 0;

    const productSalesMapped = productsData.map((p: ProductDataForInsights) => ({
      id: p.id,
      title: p.title,
      totalSold: p.variants.reduce((variantSum: number, v: typeof p.variants[0]) => 
        variantSum + v.OrderItem.reduce((orderItemSum: number, oi: typeof v.OrderItem[0]) => {
          if (oi.order?.createdAt) {
            const orderDate = new Date(oi.order.createdAt);
            const gteDate = dateFilter.gte || new Date(0);
            const lteDate = dateFilter.lte || new Date();
            if (orderDate >= gteDate && orderDate <= lteDate) {
              return orderItemSum + oi.quantity;
            }
          }
          return orderItemSum;
        }, 0)
      , 0),
      revenue: p.variants.reduce((variantSum: number, v: typeof p.variants[0]) => 
        variantSum + v.OrderItem.reduce((orderItemSum: number, oi: typeof v.OrderItem[0]) => {
          if (oi.order.createdAt) {
            const orderDate = new Date(oi.order.createdAt);
            const gteDate = dateFilter.gte || new Date(0);
            const lteDate = dateFilter.lte || new Date();
            if (orderDate >= gteDate && orderDate <= lteDate) {
              return orderItemSum + (Number(oi.price) * oi.quantity);
            }
          }
          return orderItemSum;
        }, 0)
      , 0),
    })).sort((a: { revenue: number; }, b: { revenue: number; }) => b.revenue - a.revenue);

    const recentSalesMapped = salesData.map((s: SaleData) => ({
      createdAt: new Date(s.createdAt),
      amount: Number(s.totalAmount),
    }));

    const surveyMetricsMapped = surveyResultMetrics.map(sm => ({
      categoryName: sm.categoryName,
      avgScore: sm.avgScore,
      count: sm.count,
    }));

    const currentTotalOrders = totalOrders || 0;
    const currentTotalSales = Number(totalRevenueRes._sum.totalAmount) || 0;

    const insights: InsightsData = {
      totalSales: currentTotalSales,
      totalOrders: currentTotalOrders,
      totalCustomers: totalCustomers || 0,
      averageOrderValue: currentTotalOrders > 0 ? currentTotalSales / currentTotalOrders : 0,
      topSellingProducts: productSalesMapped,
      recentSales: recentSalesMapped,
      collectionRate: overallCollectionRate,
      collectionTrends: collectionRateMetrics,
      surveyMetrics: surveyMetricsMapped,
      salesByStatus: [],
      paymentsByStatus: [],
      topCustomers: [],
    };

    return { 
      success: true, 
      data: processActionReturnData(insights) as unknown as InsightsData 
    };
  } catch (error) {
    console.error("Error in getInsights:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to fetch insights" };
  }
} 