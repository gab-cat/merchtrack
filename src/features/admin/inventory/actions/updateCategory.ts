'use server';

import { Category } from "@prisma/client";
import { verifyPermission } from "@/utils/permissions";
import prisma from "@/lib/db";
import { createNewCategorySchema } from "@/features/admin/inventory/category.schema";
import { processActionReturnData } from "@/utils";
import { createLog } from "@/actions/logs.actions";

// Define CategoryParams here as it's used by this action
type CategoryParams = {
    userId: string;
    name: string;
    description?: string;
    id?: string; // id is required for update
};

export async function updateCategory(params: CategoryParams): ActionsReturnType<Category> {
  if (!params.id) {
    return {
      success: false,
      message: "Category ID is required"
    };
  }

  const result = createNewCategorySchema.safeParse(params);
  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0].message
    };
  }

  const hasPermission = await verifyPermission({
    userId: params.userId,
    permissions: {
      inventory: { canRead: true, canUpdate: true },
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
        name: params.name,
        description: params.description
      }
    });

    await createLog({
      userId: params.userId,
      createdById: params.userId,
      reason: "Category Updated Successfully",
      systemText: `Updated category "${params.name}" (ID: ${category.id})`,
      userText: `Category "${params.name}" has been updated successfully.`
    });

    return { 
      success: true, 
      data: processActionReturnData(category) as Category
    };
  } catch {
    return { success: false, message: 'An error occurred while updating the category' };
  }
} 