'use client';

import { useQuery } from "@tanstack/react-query";
import { getPayments, getPaymentById } from "@/actions/payments.actions";
import useToast from "@/hooks/use-toast";
import { useUserStore } from "@/stores/user.store";
import { QueryParams } from "@/types/common";
import { EMPTY_PAGINATED_RESPONSE } from "@/constants";

/**
 * Retrieves a list of payments for the current user.
 *
 * This hook uses the user ID from the user store to fetch payments via the getPayments API.
 * The query is enabled only if a valid user ID is available. If the API response indicates a failure,
 * an error toast is displayed and an EMPTY_PAGINATED_RESPONSE is returned. On success, the payment data is returned.
 *
 * @param params - Optional query parameters to filter the payment results (defaults to an empty object).
 * @returns The query object from useQuery containing the fetched payment data or an empty paginated response on error.
 */
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

/**
 * Retrieves a specific payment using its identifier.
 *
 * This hook fetches payment details by querying the backend with the provided `paymentId`
 * and the current user's ID (retrieved from the user store). The query is executed only when
 * a valid `paymentId` is provided. If no `paymentId` is given or the API response indicates an error,
 * the hook returns null; otherwise, it returns the payment data.
 *
 * @param paymentId - The unique identifier for the payment to retrieve, or null to disable the query.
 *
 * @returns The result from the query, which includes the payment data on success or null if not found.
 */
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
