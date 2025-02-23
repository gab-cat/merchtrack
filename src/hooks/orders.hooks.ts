'use client';

import { getOrderById, getOrders } from "@/actions/orders.actions";
import { QueryParams } from "@/types/common";
import { useResourceByIdQuery, useResourceQuery } from "@/hooks/index.hooks";

/**
 * Fetches all orders for the current user.
 *
 * This custom hook retrieves the current user's orders by calling the `getOrders` API.
 * It constructs a query that always filters out deleted orders (i.e. `isDeleted` is false) and
 * merges any additional filtering, inclusion, or sorting options provided via the `params` object.
 * The hook leverages the `useResourceQuery` hook to manage the API call, display error toasts on failure,
 * and return a react-query result object containing the orders data, error status, and query state.
 *
 * @param params - Optional query parameters for fetching orders.
 * @param params.where - Optional where clause for filtering orders. This is merged with `{ isDeleted: false }`.
 * @param params.include - Optional clause specifying related entities to include in the response.
 * @param params.orderBy - Optional clause to define the sorting order of the orders.
 * @param params.params - Additional query parameters for the request.
 * @returns A react-query result object with the fetched orders data, error status, and query state.
 */
export function useOrdersQuery(params:QueryParams = {}) {
  return useResourceQuery({
    resource: "orders",
    fetcher: getOrders,
    params: {
      where: {
        isDeleted: false,
        ...params.where
      },
      include: params.include,
      orderBy: params.orderBy,
      page: params.page,
      limit: params.limit,
      ...params
    }
  });
}

/**
 * Fetches the details of a specific order for the current user.
 *
 * This hook uses react-query to retrieve an order's details by invoking the `getOrderById` API. It accepts a unique order identifier and
 * an optional array of fields to limit the data returned in the response. The query is executed only when a valid `orderId` is provided.
 *
 * @param orderId - The unique identifier of the order to fetch.
 * @param limitFields - An optional array specifying the fields to include in the returned order data.
 * @returns A react-query result object containing the order data on success or null if the API call fails.
 */
export function useOrderQuery(orderId: string, limitFields: string[] = []) {
  return useResourceByIdQuery({
    resource: "orders",
    fetcher: (userId: string, id: string, params: QueryParams) => getOrderById({ userId, orderId: id, limitFields: params.limitFields }),
    identifier: orderId,
    params: { limitFields }
  });
}