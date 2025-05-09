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

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: '#FFA500',
  PROCESSING: '#9333EA',
  READY: '#10B981',
  DELIVERED: '#059669',
  CANCELLED: '#EF4444',
};

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
): Promise<ActionsReturnType<InsightsData>> {
  try {
    if (!userId) {
      return {
        success: false,
        message: 'Unauthorized'
      };
    }

    const isAuthorized = await verifyPermission({
      userId,
      permissions: {
        dashboard: { canRead: true },
        reports: { canRead: true },
      }
    });

    if (!isAuthorized) {
      return {
        success: false,
        message: 'Forbidden'
      };
    }

    const dateFilter = {
      ...(params.startDate && { gte: new Date(params.startDate) }),
      ...(params.endDate && { lte: new Date(params.endDate) }),
    };

    // Ensure we have valid dates before proceeding
    if ((dateFilter.gte && isNaN(dateFilter.gte.getTime())) || 
        (dateFilter.lte && isNaN(dateFilter.lte.getTime()))) {
      return {
        success: false,
        message: 'Invalid date format'
      };
    }

    const [
      ordersData,
      salesData,
      customersCount,
      topProducts,
      topCustomers,
      ordersByStatus,
      paymentsByStatus,
      totalPayableAmount,
      surveyData
    ] = await Promise.all([
      // Get total orders
      prisma.order.count({
        where: {
          createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
          isDeleted: false,
        },
      }),
      // Get total sales and recent sales
      prisma.order.findMany({
        where: {
          createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
          isDeleted: false,
          paymentStatus: 'PAID',
        },
        select: {
          totalAmount: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      // Get total customers
      prisma.user.count({
        where: {
          role: 'STUDENT',
          orders: {
            some: {
              createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
            },
          },
        },
      }),
      // Get top selling products
      prisma.orderItem.groupBy({
        by: ['variantId'],
        where: {
          order: {
            createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
            isDeleted: false,
          },
        },
        _sum: {
          quantity: true,
          price: true,
        },
        take: 10,
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
      }).then(items => 
        Promise.all(items.map(async item => {
          const variant = await prisma.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: true },
          });
          return {
            id: variant?.product.id ?? '',
            title: variant?.product.title ?? 'Unknown Product',
            totalSold: item._sum.quantity ?? 0,
            revenue: item._sum.price ?? 0,
          };
        }))
      ),
      // Get top customers
      prisma.user.findMany({
        where: {
          role: 'STUDENT',
          orders: {
            some: {
              createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
            },
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          orders: {
            where: {
              createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
              isDeleted: false,
            },
            select: {
              totalAmount: true,
            },
          },
        },
        take: 10,
      }).then(customers =>
        customers.map(customer => ({
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          totalSpent: customer.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
          ordersCount: customer.orders.length,
        }))
      ),
      // Get orders by status
      prisma.order.groupBy({
        by: ['status'],
        where: {
          createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
          isDeleted: false,
        },
        _count: true,
      }),
      // Get payments by status
      prisma.order.groupBy({
        by: ['paymentStatus'],
        where: {
          createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
          isDeleted: false,
        },
        _count: true,
        _sum: {
          totalAmount: true,
        },
      }),
      // Get total payable amount for collection rate
      prisma.order.aggregate({
        where: {
          createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
          isDeleted: false,
        },
        _sum: {
          totalAmount: true,
        },
      }),
      // Get survey data
      prisma.customerSatisfactionSurvey.findMany({
        where: {
          submitDate: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        },
        include: {
          category: true,
        },
        orderBy: {
          submitDate: 'asc',
        },
      }),
    ]);

    const totalAmount = Number(totalPayableAmount._sum.totalAmount ?? 0);
    const totalSales = salesData.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const averageOrderValue = totalSales / (ordersData ?? 1);
    const collectionRate = totalAmount > 0 ? (totalSales / totalAmount) * 100 : 0;

    // Process the metrics using helper functions
    const collectionTrends = calculateCollectionMetrics(salesData, totalAmount);
    const surveyMetrics = processSurveyMetrics(surveyData);

    return {
      success: true,
      //@ts-expect-error - TS doesn't recognize the data transformation
      data: processActionReturnData({
        totalSales,
        totalOrders: ordersData,
        averageOrderValue,
        collectionRate,
        totalCustomers: customersCount,
        topSellingProducts: topProducts,
        recentSales: salesData.map(sale => ({
          amount: Number(sale.totalAmount),
          createdAt: sale.createdAt,
        })),
        salesByStatus: ordersByStatus.map(status => ({
          status: status.status,
          count: status._count,
          color: ORDER_STATUS_COLORS[status.status]
        })),
        paymentsByStatus: paymentsByStatus.map(status => ({
          status: status.paymentStatus,
          count: status._count,
          total: Number(status._sum.totalAmount ?? 0),
        })),
        topCustomers: topCustomers.toSorted((a, b) => b.totalSpent - a.totalSpent),
        collectionTrends,
        surveyMetrics,
      }) as InsightsData
    };
  } catch (error) {
    console.error('Error fetching insights:', error);
    return {
      success: false,
      message: 'Failed to fetch insights data'
    };
  }
}