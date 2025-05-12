'use server';

import { Category } from "@prisma/client";
import { verifyPermission } from "@/utils/permissions";
import prisma from "@/lib/db";
import { createNewCategorySchema } from "@/features/admin/inventory/category.schema";
import { processActionReturnData } from "@/utils";
import { createLog } from "@/actions/logs.actions";

// Define CategoryParams here as it's used by this action
// If used by many actions, consider moving to a shared types file
type CategoryParams = {
    userId: string;
    name: string;
    description?: string;
    id?: string; // id is optional for creation, required for update
};

export async function createCategory(params: CategoryParams): ActionsReturnType<Category> {
  const result = createNewCategorySchema.safeParse(params);
  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0].message
    };
  }

  const { name, description } = result.data;

  const hasPermission = await verifyPermission({
    userId: params.userId,
    permissions: {
      inventory: { canRead: true, canCreate: true },
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
        name,
        description
      }
    });

    await createLog({
      userId: params.userId,
      createdById: params.userId,
      reason: "Category Created Successfully",
      systemText: `Created new category "${name}" (ID: ${category.id})`,
      userText: `Category "${name}" has been created successfully.`
    });
    
    return { 
      success: true, 
      data: processActionReturnData(category) as Category
    };
  } catch {
    return { success: false, message: 'An error occurred while creating the category' };
  }
} 