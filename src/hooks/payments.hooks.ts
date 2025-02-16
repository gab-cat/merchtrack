'use client';

import { getPayments, getPaymentById } from "@/actions/payments.actions";
import { QueryParams } from "@/types/common";
import { useResourceByIdQuery, useResourceQuery } from "@/hooks/index.hooks";

/**
 * Retrieves a list of payments for the current user.
 *
 * This hook fetches payment data using the current user's ID via the `getPayments` API. It only runs if a valid user ID is present. If the API call fails, an error toast is displayed and an `EMPTY_PAGINATED_RESPONSE` is returned; on success, the retrieved payment data is provided.
 *
 * The query parameters are merged with a default filter that excludes deleted payments (`where.isDeleted` set to `false`). Additional filtering and sorting options can be specified using the `include` and `orderBy` properties.
 *
 * @param params - Optional query parameters to filter the payments. By default, it applies a filter to exclude deleted payments.
 * @returns The query object returned from `useResourceQuery`, containing the payment data or an empty paginated response in case of an error.
 *
 * @example
 * // Retrieve non-deleted, completed payments along with related user and transaction details, sorted by creation date in descending order
 * usePaymentsQuery({
 *   where: { status: 'completed' },
 *   include: ['user', 'transaction'],
 *   orderBy: { createdAt: 'desc' }
 * });
 */
export function usePaymentsQuery(params: QueryParams = {}) {
  return useResourceQuery({
    resource: "payments",
    fetcher: getPayments,
    params: {
      where: {
        isDeleted: false,
        ...params.where
      },
      include: params.include,
      orderBy: params.orderBy,
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
  return useResourceByIdQuery({
    resource: "payments",
    fetcher: (userId: string, id: string) => getPaymentById({ userId, paymentId: id }),
    identifier: paymentId as string
  });
}
