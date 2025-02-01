'use client';

import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/actions/orders.actions";
import useToast from "@/hooks/use-toast";
import { useUserStore } from "@/stores/user.store";

export function useOrdersQuery() {
  const { userId } = useUserStore();

  return useQuery({
    enabled: !!userId,
    queryKey: ["orders", "orders:all"],
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