'use server';

import { Category, PrismaClient } from "@prisma/client";
import { verifyPermission } from "@/utils/permissions";

const prisma = new PrismaClient();

export type CategoryFormState = {
  error?: string;
  success?: boolean;
};

type CreateCategoryParams = {
    userId: string;
    name: string;
};

export async function createCategory({ userId, name}: CreateCategoryParams): Promise<ActionsReturnType<Category>> {
  if (!userId) {
    return { 
      success: false,
      message: 'User ID is required'
    };
  }

  const hasPermission = await verifyPermission({
    userId,
    permissions: {
      dashboard: { canRead: true },
    }
  });

  if (!hasPermission) {
    return { 
      success: false,
      message: 'Permission denied'
    };
  }

  if (!name) {
    return { 
      success: false,
      message: 'Category name is required'
    };
  }

  try {
    const category = await prisma.category.create({
      data: {
        name
      }
    });
    
    return { success: true, data: JSON.parse(JSON.stringify(category)) };
  } catch {
    return { success: false, message: 'An error occurred while creating the category' };
  }
}