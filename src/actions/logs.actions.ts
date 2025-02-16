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