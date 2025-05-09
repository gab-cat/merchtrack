'use server';

import { SurveyCategory } from "@prisma/client";
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { PaginatedResponse, QueryParams } from "@/types/common";
import { processActionReturnData } from "@/utils";

// Get survey categories
export default async function getSurveyCategories(userId: string, params: QueryParams): ActionsReturnType<PaginatedResponse<SurveyCategory[]>> {
  const isAuthorized = await verifyPermission({
    userId,
    permissions: {
      reports: { canRead: true },
    }
  });

  if (!isAuthorized) {
    return {
      success: false,
      message: "You are not authorized to view survey categories."
    };
  }

  try {
    let categories: SurveyCategory[] | null = null;
    const total: number | null = null; // This 'total' seems unused and was part of an incomplete if block.
    // The original code had: if (!total || !categories)
    // I am keeping the logic as it was in the original file for now.
    if (!total || !categories) {
      categories = await prisma.surveyCategory.findMany({
        where: {
          isDeleted: false,
          ...params.where
        },
        include: {
          ...params.include
        }
      });
    }

    return {
      success: true,
      data: {
        data: processActionReturnData(categories) as SurveyCategory[],
        metadata: {
          total: categories?.length ?? 0,
          page: params.page ?? 1,
          lastPage: 1,
          hasNextPage: false,
          hasPrevPage: false
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch survey categories"
    };
  }
} 