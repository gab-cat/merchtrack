'use server';

import { type User } from "@clerk/nextjs/server";
import { User as PrismaUser } from "@prisma/client";
import { PaginatedResponse, QueryParams } from "@/types/common";
import { verifyPermission } from "@/utils/permissions";
import { calculatePagination } from "@/utils/query.utils";
import prisma from "@/lib/db";
import { GetObjectByTParams } from "@/types/extended";
import { ExtendedUser } from "@/types/users";
import { processActionReturnData } from "@/utils";
import clerk from "@/lib/clerk";

// The updateUserPermissions function has been moved to src/features/admin/users/actions/updateUserPermissions.ts

export const getClerkUserPublicData = async (userId: string): Promise<ActionsReturnType<User>> => {
  const clerkClient = await clerk;
  const user = await clerkClient.users.getUser(userId);

  if (!user) {
    return {
      success: false,
      message: "User not found."
    };
  }

  return {
    success: true,
    data: user
  };
};

export const getClerkUserImageUrl = async (userId: string): Promise<ActionsReturnType<string>> => {
  try {

    const userImage = null;
    if (!userImage) {
      const clerkClient = await clerk;
      const user = await clerkClient.users.getUser(userId);

      return {
        success: true,
        data: user?.imageUrl ?? ''
      };
    }

    return {
      success: true,
      data: userImage
    };
  } catch (error) {
    return {
      success: false,
      errors: { error}
    };
  }
};

type GetUsersParams = {
  userId: string
  params: QueryParams
}

/**
 * Retrieves a paginated list of users if the requesting user has the necessary permissions.
 *
 * This function verifies that the user identified by `userId` has read access to the dashboard.
 * It calculates pagination details using the provided query parameters and generates a cache key
 * based on pagination and filtering criteria. If the user data and the total count are not cached,
 * the function retrieves them from the database within a transaction and caches the results.
 * The retrieved users are then processed to remove any fields specified in `params.limitFields`.
 *
 * @param userId - The ID of the user requesting the data, used for permission verification.
 * @param params - An object containing query parameters for pagination, filtering, sorting, and field limitation.
 *
 * @returns A promise that resolves to an object indicating the operation's success. If successful, the object
 *          contains a paginated response with the processed user data and metadata (total count, current page, last page,
 *          and flags for next/previous pages). On failure, it returns an error message and error details.
 *
 * @example
 * const response = await getUsers({
 *   userId: "12345",
 *   params: {
 *     where: { active: true },
 *     orderBy: { createdAt: "desc" },
 *     limitFields: ["password"],
 *     page: 1,
 *     perPage: 10
 *   }
 * });
 *
 * if (response.success) {
 *   console.log(response.data.metadata.total);
 *   console.log(response.data.data);
 * } else {
 *   console.error(response.message);
 * }
 */
export async function getUsers({userId, params}: GetUsersParams): Promise<ActionsReturnType<PaginatedResponse<PrismaUser[]>>> {
  if (!await verifyPermission({
    userId,
    permissions: {
      users: { canRead: true },
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to view users."
    };
  }
  
  
  const { skip, take, page } = calculatePagination(params);

  try {
    let users: PrismaUser[] | null = null;
    let total: number | null = null;

    if (!users || !total) {
      [users, total] = await prisma.$transaction([
        prisma.user.findMany({
          where: params.where,
          skip,
          take,
          orderBy: params.orderBy,
        }),
        prisma.user.count({
          where: params.where
        })
      ]);
    }

    const lastPage = Math.ceil(total/ take);

    return {
      success: true,
      data: {
        data: processActionReturnData(users, params.limitFields) as PrismaUser[],
        metadata: {
          total: total,
          page: page,
          lastPage: lastPage,
          hasNextPage: page < lastPage,
          hasPrevPage: page > 1
        }
      }
    };

  } catch (error) {
    return {
      success: false,
      message: "You are not authorized to view users.",
      errors: { error }
    };
  }
};


/**
 * Retrieves detailed information for a user identified by a unique lookup identifier (email) while applying field restrictions.
 *
 * This asynchronous function checks whether the current user (provided via `userId`) has the required read
 * permission on the dashboard. It attempts to fetch the user's data from a cache using the key constructed with
 * the user lookup identifier. If the data is not cached, it queries the database for the user, including related
 * entities such as logs, orders, payments, and permissions, and stores the retrieved record in the cache. Afterward,
 * it removes any fields specified in `limitFields` from the user data before returning the result.
 *
 * @param userId - The ID of the current user performing the request.
 * @param limitFields - An array of field names that should be omitted from the returned user data.
 * @param userLookupId - The unique identifier (typically an email) used to locate the user in the database.
 * @returns A promise that resolves to an object containing:
 *            - `success`: A boolean indicating whether the operation was successful.
 *            - `data`: The extended user information with restricted fields if the operation is successful.
 *            - `message`: An error message if the user is not authorized, not found, or if an error occurs.
 *
 * @example
 * // Example usage:
 * const result = await getUser({ 
 *   userId: 'currentUserId123', 
 *   limitFields: ['password', 'ssn'], 
 *   userLookupId: 'user@example.com' 
 * });
 *
 * if (result.success) {
 *   console.log('User data:', result.data);
 * } else {
 *   console.error('Error:', result.message);
 * }
 */
export async function getUser({userId, limitFields, userLookupId, include}: GetObjectByTParams<"userLookupId">): Promise<ActionsReturnType<ExtendedUser>> {
  if (!await verifyPermission({
    userId,
    permissions: {
      users: { canRead: true },
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to view users."
    };
  }
  
  try {
    let user: PrismaUser | null = null;
    if (!user) {
      user = await prisma.user.findFirst({
        where: { 
          OR: [
            { email: userLookupId },
            { id: userLookupId },
          ] 
        },
        include: {
          logs: true,
          createdLogs: true,
          orders: true,
          payments: true,
          manager: true,
          User: true,
          userPermissions: true,
          createdTickets: true,
          Cart: true,
          ...include
        }
      });
    }

    if (!user) {
      return {
        success: false,
        message: "User not found."
      };
    }

    return {
      success: true,
      data: processActionReturnData(user, limitFields) as ExtendedUser
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message
    };
  }
}
