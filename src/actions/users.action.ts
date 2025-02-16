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