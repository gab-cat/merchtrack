'use server';

import { clerkClient, type User } from "@clerk/nextjs/server";
import { User as PrismaUser } from "@prisma/client";
import { getCached, setCached } from "@/lib/redis";
import { verifyPermission } from "@/utils/permissions";
import prisma from "@/lib/db";
import { QueryParams, PaginatedResponse } from "@/types/common";
import { calculatePagination, removeFields } from "@/utils/query.utils";

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

type GetUserByEmailParams = {
  email: string
  userId: string
  limitFields?: string[]
}

export const getUserByEmail = async ({ email, userId, limitFields }: GetUserByEmailParams): Promise<ActionsReturnType<PrismaUser>> => {
  if (!await verifyPermission({
    userId: userId,
    permissions: {
      dashboard: { canRead: true }
    }
  })) {
    return {
      success: false,
      message: "You do not have permission to perform this action"
    };
  }

  try {
    let user: PrismaUser | null = await getCached(`user:email:${email}`);
    
    if (!user) {
      user = await prisma.user.findFirst({
        where: { email }
      });
      
      if (user) {
        await setCached(`user:email:${email}`, user, 60 * 30); // Cache for 30 minutes
      }
    }

    if (!user) {
      return {
        success: false,
        message: "User not found."
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(removeFields(user, limitFields)))
    };
  } catch (error) {
    return {
      success: false,
      errors: { error },
      message: "An error occurred while fetching the user"
    };
  }
};

export const getUsers = async (
  userId: string,
  params: QueryParams = {}
): Promise<ActionsReturnType<PaginatedResponse<PrismaUser[]>>> => {
  if (!await verifyPermission({
    userId,
    permissions: {
      dashboard: { canRead: true }
    }
  })) {
    return {
      success: false,
      message: "You do not have permission to perform this action"
    };
  }

  const { skip, take, page } = calculatePagination(params);

  try {
    let users: PrismaUser[] | null = await getCached(`users:${page}:${take}`);
    let total: number | null = await getCached('users:total');

    if (!users || !total) {
      [users, total] = await prisma.$transaction([
        prisma.user.findMany({
          skip,
          take
        }),
        prisma.user.count()
      ]);
      
      await Promise.all([
        setCached(`users:${page}:${take}`, users, 60 * 15), // Cache for 15 minutes
        setCached('users:total', total, 60 * 15)
      ]);
    }

    const lastPage = Math.ceil(total / take);
    const processedUsers = users.map(user => removeFields(user, params.limitFields));

    return {
      success: true,
      data: {
        data: JSON.parse(JSON.stringify(processedUsers)),
        metadata: {
          total,
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
      errors: { error },
      message: "An error occurred while fetching users"
    };
  }
};