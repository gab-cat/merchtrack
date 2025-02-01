'use client';

import { useQuery } from "@tanstack/react-query";
import { getPayments, getPaymentById } from "@/actions/payments.actions";
import useToast from "@/hooks/use-toast";
import { useUserStore } from "@/stores/user.store";
import { QueryParams } from "@/types/common";
import { EMPTY_PAGINATED_RESPONSE } from "@/constants";

export function usePaymentsQuery(params: QueryParams = {}) {
  const { userId } = useUserStore();

  return useQuery({
    enabled: !!userId,
    queryKey: ["payments:all", params],
    queryFn: async () => {
      const response = await getPayments(userId as string, params);
      if (!response.success) {
        useToast({
          type: "error",
          message: response.message as string,
          title: "Error fetching payments",
        });
        return EMPTY_PAGINATED_RESPONSE;
      }
      return response.data;
    }
  });
}

export function usePaymentQuery(paymentId: string | null) {
  const { userId } = useUserStore();

  return useQuery({
    queryKey: [`payments:${paymentId}`],
    queryFn: async () => {
      if (!paymentId) return null;
      const response = await getPaymentById({
        userId: userId as string,
        paymentId
      });
      return response.success ? response.data : null;
    },
    enabled: !!paymentId
  });
}
