'use client';

import { useQuery } from "@tanstack/react-query";
import { getOrderById, getOrders } from "@/actions/orders.actions";
import useToast from "@/hooks/use-toast";
import { useUserStore } from "@/stores/user.store";

export function useOrdersQuery() {
  const { userId } = useUserStore();

  return useQuery({
    enabled: !!userId,
    queryKey: ["orders:all"],
    queryFn: async () => {
      const response = await getOrders(userId as string);
      if (!response.success) {
        useToast({
          type: "error",
          message: response.message as string,
          title: "Error fetching orders",
        });
        return [];
      }
      return response.data ?? [];
    },
    initialData: [],
  });
};

export function useOrderQuery(orderId: string | null) {
  const { userId } = useUserStore();

  return useQuery({
    queryKey: [`orders:${orderId}`],
    queryFn: async () => {
      if (!orderId) return null;
      const response = await getOrderById({
        userId: userId as string,
        orderId: orderId
      });
      return response.success ? response.data : null;
    },
    enabled: !!orderId
  });
}