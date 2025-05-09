'use client';

import { useQuery } from '@tanstack/react-query';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { getInsights } from '@/features/admin/insights/_actions';
import { useUserStore } from '@/stores/user.store';

export interface InsightsData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  topSellingProducts: {
    id: string;
    title: string;
    totalSold: number;
    revenue: number;
  }[];
  recentSales: {
    amount: number;
    createdAt: Date;
  }[];
  collectionRate: number;
  salesByStatus: {
    status: OrderStatus;
    count: number;
    color: string;
  }[];
  paymentsByStatus: {
    status: PaymentStatus;
    count: number;
    total: number;
  }[];
  topCustomers: {
    id: string;
    name: string;
    totalSpent: number;
    ordersCount: number;
  }[];
  collectionTrends: {
    date: string;
    collectionRate: number;
  }[];
  surveyMetrics: {
    categoryName: string;
    avgScore: number;
    count: number;
  }[];
}

export function useInsights(
  startDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0, 0),
  endDate: Date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999)
) {
  const { userId } = useUserStore();
  return useQuery({
    enabled: !!userId,
    queryKey: ['insights', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      const response = await getInsights(userId!, {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      });
      
      if (!response.success) {
        throw new Error(response.message);
      }

      return response.data;
    },
  });
}