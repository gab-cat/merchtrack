'use server';

import { SurveyCategory } from "@prisma/client";
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { processActionReturnData } from "@/utils";

// Create survey category
export default async function createSurveyCategory(params: {
  userId: string;
  name: string;
  description?: string;
  question1: string;
  question2: string;
  question3: string;
  question4: string;
}): ActionsReturnType<SurveyCategory> {
  const isAuthorized = await verifyPermission({
    userId: params.userId,
    permissions: {
      reports: { canCreate: true },
    }
  });

  if (!isAuthorized) {
    return {
      success: false,
      message: "You are not authorized to create survey categories."
    };
  }

  try {
    const category = await prisma.surveyCategory.create({
      data: {
        name: params.name,
        description: params.description,
        question1: params.question1,
        question2: params.question2,
        question3: params.question3,
        question4: params.question4
      }
    });

    return {
      success: true,
      data: processActionReturnData(category) as SurveyCategory
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create survey category"
    };
  }
} 