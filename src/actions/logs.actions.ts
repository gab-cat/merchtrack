'use server';

import prisma from "@/lib/db";
import { getCached, setCached } from "@/lib/redis";
import { PaginatedResponse, QueryParams } from "@/types/common";
import { ExtendedLogs } from "@/types/logs";
import { verifyPermission } from "@/utils/permissions";
import { removeFields } from "@/utils/query.utils";

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
    
    // Invalidate logs cache
    await Promise.all([
      setCached('logs:total', null),
      setCached('logs:*', null) // Clear all paginated logs cache
    ]);

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
 * This asynchronous function first checks if the requesting user has the required permission to view logs.
 * If the user is unauthorized, it returns a failure response with an appropriate message.
 * If authorized, the function attempts to retrieve log data and the total count from a Redis cache using the provided paging parameters.
 * If the data is not cached, it performs a database transaction with Prisma to fetch the logs and count them.
 * After fetching, the logs and total count are cached for future requests.
 * The fetched logs are then processed to remove any fields specified in the `params.limitFields` array.
 * The function returns a paginated response that includes the log data and metadata such as total count, current page,
 * last page, and indicators for the presence of adjacent pages.
 *
 * @param userId - The unique identifier of the user making the request.
 * @param params - Optional query parameters for log retrieval, including:
 *   - page: The current page number.
 *   - take: The number of logs to return per page.
 *   - where: Filtering criteria for querying logs.
 *   - orderBy: Sorting options for the logs.
 *   - skip: The number of records to skip.
 *   - limitFields: An array of field names to remove from each log entry.
 * @returns A promise that resolves to an object indicating success and containing:
 *   - data: When successful, an object with:
 *       - data: An array of processed log entries.
 *       - metadata: Pagination details including:
 *           - total: Total number of log entries.
 *           - page: The current page number.
 *           - lastPage: The last available page number.
 *           - hasNextPage: A boolean indicating if there is a subsequent page.
 *           - hasPrevPage: A boolean indicating if there is a preceding page.
 *   - message: An error message if the operation fails.
 */
export async function getLogs({userId, params = {} }: GetLogsParams): Promise<ActionsReturnType<PaginatedResponse<ExtendedLogs[]>>> {
  const isAuthorized = await verifyPermission({
    userId,
    permissions: {
      dashboard: { canRead: true },
    },
  });

  if (!isAuthorized) {
    return {
      success: false,
      message: "You are not authorized to view logs.",
    };
  }

  try {
    let logs: ExtendedLogs[] | null = await getCached(`logs:${params.page}:${params.take}`);
    let total: number | null = await getCached('logs:total');
  
    if (!logs) {
      [logs, total] = await prisma.$transaction([
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
          skip: params.skip,
          take: params.take,
        }),
        prisma.log.count( { where: params.where } ),
      ]);

      Promise.all([
        await setCached(`logs:${params.page}:${params.take}`, logs),
        await setCached('logs:total', total),
      ]);
    }

    const lastPage = Math.ceil(total as number / (params.take ?? 1));
    const processedLogs = logs.map(log => {
      return removeFields(log, params.limitFields);
    });
    
    return {
      success: true,
      data: {
        data: JSON.parse(JSON.stringify(processedLogs)),
        metadata: {
          total: total as number,
          page: params.page!,
          lastPage: lastPage,
          hasNextPage: params.page! < lastPage,
          hasPrevPage: params.page! > 1
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