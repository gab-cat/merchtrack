'use server';

import { Category } from "@prisma/client";
import { verifyPermission } from "@/utils/permissions";
import prisma from "@/lib/db";
import { createNewCategorySchema } from "@/schema/category.schema";



type CreateCategoryParams = {
    userId: string;
    name: string;
};

export async function createCategory(params: CreateCategoryParams): Promise<ActionsReturnType<Category>> {
  const result = createNewCategorySchema.safeParse(params);
  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0].message
    };
  }

  const { name } = result.data;

  const hasPermission = await verifyPermission({
    userId: params.userId,
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