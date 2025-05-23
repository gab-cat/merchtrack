'use server';
import prisma from "@/lib/db";
import { getCached, setCached } from "@/lib/redis";

type DashboardReturnType = {
    users: {
      total: number;
      change: string;
    };
    sales: {
      total: number;
      change: string;
    };
    products: {
      total: number;
      change: string;
    };
    system: {
      status: string;
      subtext: string;
    };
}

export default async function getDashboardStats(): ActionsReturnType<DashboardReturnType> {
  try {
    // Check if cached data exists
    const cachedData = await getCached<DashboardReturnType>('dashboard-stats');
    if (cachedData) {
      return {
        success: true,
        data: cachedData
      };
    }
    const [
      totalUsers,
      totalSales,
      activeProducts,
      recentLogs
    ] = await Promise.all([
      // Get total users
      prisma.user.count(),
      
      // Get total sales
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        },
        where: {
          status: 'DELIVERED'
        }
      }),
      
      // Get active products
      prisma.product.count({
        where: {
          isDeleted: false
        }
      }),
      
      // Get recent system logs for health check
      prisma.log.findMany({
        take: 100,
        orderBy: [{
          createdDate: 'desc'
        }],
        where: {
          reason: {
            contains: 'ERROR'
          }
        }
      })
    ]);

    // Calculate month-over-month changes
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const [
      lastMonthUsers,
      lastMonthSales,
      lastMonthProducts
    ] = await Promise.all([
      // Last month users
      prisma.user.count({
        where: {
          createdAt: {
            lt: lastMonth
          }
        }
      }),
      
      // Last month sales
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        },
        where: {
          status: 'DELIVERED',
          createdAt: {
            lt: lastMonth
          }
        }
      }),
      
      // Last month active products
      prisma.product.count({
        where: {
          isDeleted: false,
          createdAt: {
            lt: lastMonth
          }
        }
      })
    ]);

    const currentSales = totalSales._sum?.totalAmount ?? 0;
    const previousSales = lastMonthSales._sum?.totalAmount ?? 1; // Prevent division by zero
    
    // Calculate percentage changes
    const userChange = ((totalUsers - (lastMonthUsers || 1)) / (lastMonthUsers || 1) * 100).toFixed(1);
    const salesChange = ((currentSales - previousSales) / previousSales * 100).toFixed(1);
    const productsChange = ((activeProducts - (lastMonthProducts || 1)) / (lastMonthProducts || 1) * 100).toFixed(1);

    // Calculate system health based on error logs
    const errorRate = (recentLogs.length / 100) * 100;
    const systemHealth = errorRate < 5 ? 'Healthy' : errorRate < 15 ? 'Degraded' : 'Critical';
    const uptimeChange = errorRate < 5 ? '99.9% uptime' : errorRate < 15 ? '99% uptime' : '95% uptime';

    const dashboardStats: DashboardReturnType = {
      users: {
        total: totalUsers,
        change: userChange
      },
      sales: {
        total: currentSales,
        change: salesChange
      },
      products: {
        total: activeProducts,
        change: productsChange
      },
      system: {
        status: systemHealth,
        subtext: uptimeChange
      }
    };
    setCached('dashboard-stats', dashboardStats, "5m");

    return {
      success: true,
      data: dashboardStats
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch dashboard stats"
    };
  }
}