'use server';

import { clerkClient, type User } from "@clerk/nextjs/server";
import { User as PrismaUser, UserPermission, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getCached, setCached } from "@/lib/redis";
import { PaginatedResponse, QueryParams } from "@/types/common";
import { verifyPermission } from "@/utils/permissions";
import { calculatePagination, removeFields } from "@/utils/query.utils";
import prisma from "@/lib/db";
import { GetObjectByTParams } from "@/types/extended";
import { ExtendedUser } from "@/types/users";

export const getClerkUserPublicData = async (userId: string): Promise<ActionsReturnType<User>> => {
  const user = await (await clerkClient()).users.getUser(userId);

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

    const userImage = await getCached<string>(`user:${userId}:image`);
    if (!userImage) {
      const user = await (await clerkClient()).users.getUser(userId);
      await setCached(`user:${userId}:image`, user?.imageUrl, 60 * 30);

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
      dashboard: { canRead: true },
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to view users."
    };
  }
  
  const { skip, take, page } = calculatePagination(params);
  const cacheKey = `users:${page}:${take}:${JSON.stringify(params.where)}:${JSON.stringify(params.orderBy)}`;

  try {
    let users: PrismaUser[] | null = await getCached(cacheKey);
    let total: number | null = await getCached('users:total');

    if (!users || !total) {
      [users, total] = await prisma.$transaction([
        prisma.user.findMany({
          where: params.where,
          skip,
          take,
          orderBy: params.orderBy,
        }),
        prisma.user.count()
      ]);
      Promise.all([
        await setCached(cacheKey, users),
        await setCached('users:total', total),
      ]);
    }

    const lastPage = Math.ceil(total/ take);
    const processedUsers = users.map(user => {
      return removeFields(user, params.limitFields);
    });

    return {
      success: true,
      data: {
        data: JSON.parse(JSON.stringify(processedUsers)),
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
export async function getUser({userId, limitFields, userLookupId}: GetObjectByTParams<"userLookupId">): Promise<ActionsReturnType<ExtendedUser>> {
  if (!await verifyPermission({
    userId,
    permissions: {
      dashboard: { canRead: true },
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to view users."
    };
  }
  
  try {
    let user: PrismaUser | null = await getCached(`user:${userLookupId}`);
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: userLookupId },
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
        }
      });
      await setCached(`user:${userLookupId}`, user);
    }

    if (!user) {
      return {
        success: false,
        message: "User not found."
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(removeFields(user, limitFields) as ExtendedUser))
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message
    };
  }
}

type UpdateUserRoleParams = {
  userId: string;
  currentUserId: string;
  role: Role;
};

/**
 * Updates a user's role.
 *
 * This asynchronous function first verifies that the current user has the required permissions to update user roles.
 * If the permission check passes, it updates the specified user's role in the database, creates a log entry for the update,
 * and invalidates the corresponding cache. If any step fails, it returns a failure response with an appropriate error message.
 *
 * @param userId - The ID of the user whose role is to be updated.
 * @param currentUserId - The ID of the user performing the update, used for permission verification and logging.
 * @param role - The new role to assign to the user.
 * @returns A promise that resolves to an object indicating whether the operation was successful. On success,
 *          the object contains the updated user data; on failure, it contains an error message and error details.
 *
 * @example
 * const response = await updateUserRole({ userId: "user-123", currentUserId: "admin-456", role: "admin" });
 * if (response.success) {
 *   console.log("User role updated:", response.data);
 * } else {
 *   console.error("Failed to update user role:", response.message);
 * }
 */
export async function updateUserRole({ userId, currentUserId, role }: UpdateUserRoleParams): Promise<ActionsReturnType<PrismaUser>> {
  if (!await verifyPermission({
    userId: currentUserId,
    permissions: {
      'users': { canUpdate: true }
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to update user roles."
    };
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });
    
    // Log the role update
    await prisma.log.create({
      data: {
        reason: 'USER_ROLES',
        systemText: `Updated role for user ${userId} to ${role}`,
        userText: `Updated user role to ${role}`,
        createdBy: {
          connect: {
            id: currentUserId
          }
        },
        user: {
          connect: {
            id: userId
          }
        }
      }
    });

    revalidatePath('/admin/users/[email]');
    await setCached(`user:${updatedUser.email}`, null); // Invalidate cache

    return {
      success: true,
      data: updatedUser
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update user role",
      errors: { error }
    };
  }
}

type UpdateUserPermissionsParams = {
  userId: string;
  currentUserId: string;
  permissions: Record<string, Partial<UserPermission>>;
};

/**
 * Updates the permissions for a specified user.
 *
 * This function verifies that the current user has the required permission to update user permissions. It then performs an upsert operation within a transaction for each permission provided, ensuring that existing records are updated and new records are created when necessary. After updating, a corresponding log is recorded, the relevant cache is invalidated, and the administration path is revalidated.
 *
 * @param userId - The ID of the user whose permissions are being updated.
 * @param currentUserId - The ID of the user attempting to perform the update. This user must have permission to update user permissions.
 * @param permissions - An object containing the permission updates, where each key is a permission ID and its value contains the update details.
 * @returns A promise that resolves to an object indicating success or failure. On success, the updated permissions are returned; on failure, an error message and details are provided.
 */
export async function updateUserPermissions({ userId, currentUserId, permissions }: UpdateUserPermissionsParams): Promise<ActionsReturnType<UserPermission[]>> {
  console.log('updateUserPermissions', userId, currentUserId, permissions);
  if (!await verifyPermission({
    userId: currentUserId,
    permissions: {
      users: { canUpdate: true }
    },
    logDetails: {
      actionDescription: 'update user permissions',
      userText: `Attempted to update permissions for user ${userId}`
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to update user permissions."
    };
  }

  try {
    const updates = Object.entries(permissions).map(([permissionId, permission]) => 
      prisma.userPermission.upsert({
        where: {
          userId_permissionId: {
            userId: userId,
            permissionId
          }
        },
        update: permission,
        create: {
          userId: userId,
          permissionId,
          ...permission
        }
      })
    );

    const updatedPermissions = await prisma.$transaction(updates);
    
    // Log the permission update
    await prisma.log.create({
      data: {
        reason: 'USER_PERMISSIONS',
        systemText: `Updated permissions for user ${userId}`,
        userText: `Updated user permissions`,
        createdBy: {
          connect: {
            id: currentUserId
          }
        },
        user: {
          connect: {
            id: userId
          }
        }
      }
    });

    revalidatePath('/admin/users/[email]');
    await setCached(`permissions:${userId}`, null); // Invalidate permissions cache

    return {
      success: true,
      data: updatedPermissions
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update user permissions";
    return {
      success: false,
      message,
      errors: { error }
    };
  }
}