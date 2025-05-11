'use client';

import { useResourceByIdQuery, useResourceQuery } from "@/hooks/index.hooks";
import { QueryParams } from "@/types/common";
import { getTickets, getTicketById } from "@/features/admin/tickets/actions";

/**
 * Retrieves a paginated list of tickets for the authenticated user.
 *
 * This hook uses React Query to fetch tickets by calling the `getTickets` API. It automatically retrieves the current user's ID
 * from the store and initiates the API call only when a valid user ID is present. The hook supports a configurable set of query parameters
 * to customize filtering, pagination, and sorting.
 *
 * @param params - Optional parameters for the ticket query. Supported properties include:
 *                 - where: Additional filtering conditions.
 *                 - include: Related data to include in the response.
 *                 - orderBy: Criteria for sorting the results.
 *                 - take: Number of items to fetch per page.
 *                 - skip: Number of items to skip for pagination.
 *                 - page: Specific page number to retrieve.
 *                 - limit: Maximum number of tickets to fetch.
 *                 Defaults to an empty object.
 * @returns An object representing the React Query state, including properties such as `data`, `error`, and `status`.
 *
 * @example
 * const { data, error, status } = useTicketsQuery({ page: 1, take: 10, orderBy: { createdAt: "desc" } });
 */
export function useTicketsQuery(params: QueryParams = {}) {
  const { where, include, orderBy, take = 10, skip, page, limit } = params;
  
  return useResourceQuery({
    resource: "tickets",
    fetcher: (userId: string, params: QueryParams) => getTickets({ userId, params }),
    params: {
      where,
      include,
      orderBy,
      take,
      skip,
      page,
      limit
    }
  });
}

/**
 * Retrieves a ticket by its ID.
 *
 * This hook fetches a single ticket by calling the `getTicketById` API function using the current user's ID from the user store. 
 * It leverages React Query to cache and manage the request.
 *
 * @param ticketId - The unique identifier for the ticket.
 * @param limitFields - An optional array specifying which fields to limit in the fetched ticket data.
 * @returns A query object from React Query containing the ticket data on success, or `null` if the ticket is not found or an error occurs.
 *
 * @example
 * const { data, error, isLoading } = useTicketQuery('12345', ['title', 'status']);
 */
export function useTicketQuery(ticketId: string, limitFields: string[] = []) {
  return useResourceByIdQuery({
    resource: "tickets",
    fetcher: (userId: string, id: string, params: QueryParams) => 
      getTicketById({ userId, ticketId: id, limitFields: params.limitFields }),
    identifier: ticketId,
    params: { limitFields },
  });
}