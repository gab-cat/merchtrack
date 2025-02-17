'use client';

import { getLogs } from "@/actions/logs.actions";
import { useResourceQuery } from "@/hooks/index.hooks";
import { QueryParams } from "@/types/common";

/**
 * Custom hook to query log data with filtering, sorting, and pagination.
 *
 * This hook leverages the useResourceQuery hook to fetch logs based on the provided
 * query parameters. It extracts filtering conditions (where), relations to include, sorting
 * order (orderBy), and pagination options (take, skip, page) from the input parameters.
 * The "take" parameter defaults to 10 if not specified. The hook calls getLogs with the
 * user ID and these parameters to retrieve the corresponding logs.
 *
 * @param params - An optional object containing query parameters:
 *                 - where: Conditions to filter the logs.
 *                 - include: Related entities to include in the query.
 *                 - orderBy: Criteria for sorting the logs.
 *                 - take: The number of log entries to fetch (default is 10).
 *                 - skip: The number of log entries to skip.
 *                 - page: The page number for pagination.
 * @returns An object returned by useResourceQuery containing the logs data and additional query metadata.
 *
 * @example
 * // Fetch logs where level is 'error' and limit the result to 5 entries
 * const logsQuery = useLogsQuery({ where: { level: 'error' }, take: 5 });
 * if (logsQuery.data) {
 *   console.log(logsQuery.data);
 * }
 */
export function useLogsQuery(params: QueryParams = {}) {
  const { where, include, orderBy, take = 10, skip, page } = params;
  
  return useResourceQuery({
    resource: "logs",
    fetcher: (userId: string, params: QueryParams) => getLogs({ userId, params }),
    params: {
      where,
      include,
      orderBy,
      take,
      skip,
      page
    }
  });
}