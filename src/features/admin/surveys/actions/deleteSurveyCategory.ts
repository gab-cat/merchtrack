'use server';

import { SurveyCategory } from "@prisma/client";
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { processActionReturnData } from "@/utils";

// Delete survey category (soft delete)
export default async function deleteSurveyCategory(params: {
  userId: string;
  id: string;
}): ActionsReturnType<SurveyCategory> {
  const isAuthorized = await verifyPermission({
    userId: params.userId,
    permissions: {
      reports: { canDelete: true },
    }
  });

  if (!isAuthorized) {
    return {
      success: false,
      message: "You are not authorized to delete survey categories."
    };
  }

  try {
    const category = await prisma.surveyCategory.update({
      where: { id: params.id },
      data: { isDeleted: true }
    });

    return {
      success: true,
      data: processActionReturnData(category) as SurveyCategory
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete survey category"
    };
  }
} 