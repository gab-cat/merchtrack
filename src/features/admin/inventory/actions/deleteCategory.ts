'use server';

import { Category } from "@prisma/client";
import { verifyPermission } from "@/utils/permissions";
import prisma from "@/lib/db";
import { processActionReturnData } from "@/utils";
import { createLog } from "@/actions/logs.actions";

export async function deleteCategory(params: { userId: string; id: string }): ActionsReturnType<Category> {
  const hasPermission = await verifyPermission({
    userId: params.userId,
    permissions: {
      inventory: { canRead: true, canDelete: true },
    }
  });

  if (!hasPermission) {
    return { 
      success: false,
      message: 'Permission denied'
    };
  }

  try {
    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        isDeleted: true
      }
    });

    await createLog({
      userId: params.userId,
      createdById: params.userId,
      reason: "Category Deleted Successfully",
      systemText: `Deleted category (ID: ${category.id})`,
      userText: "Category has been deleted successfully."
    });

    return { 
      success: true, 
      data: processActionReturnData(category) as Category
    };
  } catch {
    return { success: false, message: 'An error occurred while deleting the category' };
  }
} 