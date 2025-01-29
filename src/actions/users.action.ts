'use server';

import { clerkClient, type User } from "@clerk/nextjs/server";
import { getCached, setCached } from "@/lib/redis";

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