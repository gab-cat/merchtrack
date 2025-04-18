'use server';

import prisma from "@/lib/db";
import { PaginatedResponse, QueryParams } from "@/types/common";
import { ExtendedLogs } from "@/types/logs";
import { verifyPermission } from "@/utils/permissions";
import { processActionReturnData } from "@/utils";

type GetLogsParams = {
    userId: string,
    params: QueryParams
}

type CreateLogParams = {
  userId?: string;  // The affected user
  createdById?: string; // The user performing the action
  reason: string;  // Short action description
  systemText: string; // Detailed system message
  userText: string;  // User-friendly message
}

/**
 * Creates a new log entry in the database and clears the associated cache.
 *
 * This asynchronous function attempts to create a log record using Prisma with the provided details.
 * Upon successful creation, it invalidates cached log information to ensure that future queries retrieve
 * the most up-to-date data. If an error occurs during either the log creation or cache invalidation, the error
 * is logged to the console, and a failure response is returned.
 *
 * @param userId - The ID of the user for whom the log is being created.
 * @param createdById - The ID of the user or process that is creating the log entry.
 * @param reason - A description of the reason for the log entry.
 * @param systemText - A message intended for system logs.
 * @param userText - A message intended for user display.
 *
 * @returns An object with a `success` flag. On success, the object contains the created log entry in `data`;
 * otherwise, it includes an error message in `message`.
 */
export async function createLog({
  userId,
  createdById,
  reason,
  systemText,
  userText
}: CreateLogParams) {
  try {
    const log = await prisma.log.create({
      data: {
        userId,
        createdById,
        reason,
        systemText,
        userText
      }
    });

    return {
      success: true,
      data: log
    };
  } catch (error) {
    console.error('Error creating log:', error);
    return {
      success: false,
      message: (error as Error).message
    };
  }
}

/**
 * Retrieves paginated log entries for a user after verifying read permissions.
 *
 * This asynchronous function first checks if the user has the necessary permissions to read logs.
 * If the user is unauthorized, it returns a failure response with an appropriate error message.
 * If authorized, the function attempts to retrieve the logs and their total count from a Redis cache using
 * a cache key derived from the query parameters. If the data is not found in the cache, it fetches the logs and count
 * from the database using a Prisma transaction and then caches the results.
 *
 * The function applies pagination based on the provided parameters, ensuring that the number of logs returned per page
 * is at least 1 and at most 100 (defaulting to 10 if not specified). The current page is computed from the `skip` value,
 * and the last page is derived from the total count of logs. Additionally, any fields specified in the `params.limitFields`
 * array are removed from each log entry before returning the response.
 *
 * @param userId - The unique identifier of the requesting user.
 * @param params - Optional parameters for filtering, sorting, and paginating the logs, including:
 *   - where: Filtering criteria for querying logs.
 *   - orderBy: Sorting options for the log entries.
 *   - take: Number of logs to return per page (default is 10; maximum is 100).
 *   - skip: Number of records to skip (default is 0).
 *   - limitFields: An array of field names to remove from each log entry.
 * @returns A promise that resolves to an object containing:
 *   - success: A boolean indicating whether the operation was successful.
 *   - data: When successful, an object with:
 *       - data: An array of processed log entries.
 *       - metadata: Pagination details including:
 *           - total: Total number of log entries.
 *           - page: The current page number.
 *           - lastPage: The total number of pages.
 *           - hasNextPage: A boolean indicating if there is a subsequent page.
 *           - hasPrevPage: A boolean indicating if there is a preceding page.
 *   - message: An error message in case of failure.
 */
export async function getLogs({userId, params = {} }: GetLogsParams): Promise<ActionsReturnType<PaginatedResponse<ExtendedLogs[]>>> {
  const isAuthorized = await verifyPermission({
    userId,
    permissions: {
      logs: { canRead: true },
    },
  });

  if (!isAuthorized) {
    return {
      success: false,
      message: "You are not authorized to view logs.",
    };
  }

  try {
    const take = Math.max(1, Math.min(params.take ?? 10, 100)); // Limit max items
    const skip = Math.max(0, params.skip ?? 0);
    const page = Math.floor(skip / take) + 1;
    
    let logs: ExtendedLogs[] | null = null;
    let total: number | null = null;
  
    if (!logs) {
      const [rawLogs, count] = await prisma.$transaction([
        prisma.log.findMany({
          where: params.where,
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                clerkId: true,
              },
            },
            createdBy: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                clerkId: true,
              },
            },
          },
          orderBy: params.orderBy,
          skip,
          take,
        }),
        prisma.log.count({ where: params.where }),
      ]);

      logs = rawLogs as ExtendedLogs[];
      total = count;
    }

    const lastPage = Math.ceil((total as number) / take);
    
    return {
      success: true,
      data: {
        data: processActionReturnData(logs, params.limitFields) as ExtendedLogs[],
        metadata: {
          total: total as number,
          page,
          lastPage,
          hasNextPage: page < lastPage,
          hasPrevPage: page > 1
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message,
    };
  }
  
}