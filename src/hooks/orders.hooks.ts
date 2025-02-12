'use client';
;
import { getOrderById, getOrders } from "@/actions/orders.actions";
import { QueryParams } from "@/types/common";
import { useResourceByIdQuery, useResourceQuery } from "@/hooks/index.hooks";

/**
 * Custom hook for fetching all orders for the current user.
 *
 * Retrieves the current user's orders by calling the `getOrders` API, using the provided query parameters.
 * The hook obtains the user's ID from the user store and only enables the query if the user ID exists.
 * If the API call fails, an error toast is displayed and an `EMPTY_PAGINATED_RESPONSE` is returned. Otherwise,
 * it returns the fetched orders data.
 *
 * @param params - Optional query parameters for fetching orders; defaults to an empty object.
 * @returns The react-query result object containing the orders data, error status, and query state.
 */
export function useOrdersQuery(params: QueryParams = {}) {
  return useResourceQuery({
    resource: "orders",
    fetcher: getOrders,
    params
  });
}

/**
 * Fetches a specific order for the current user.
 *
 * This hook uses react-query's `useQuery` to retrieve the details of an order identified by `orderId`.
 * It obtains the user ID from the user store and calls the `getOrderById` function.
 * If `orderId` is null or the API response indicates a failure, the query returns null.
 * The query is enabled only when a valid `orderId` is provided.
 *
 * @param orderId - The unique identifier of the order, or null if no order is selected.
 * @returns The react-query result object containing the order data on success, or null otherwise.
 */
export function useOrderQuery(orderId: string | null) {
  return useResourceByIdQuery({
    resource: "orders",
    fetcher: (userId: string, id: string) => getOrderById({ userId, orderId: id }),
    identifier: orderId as string
  });
}