'use server';

import { CustomerSatisfactionSurvey, SurveyCategory } from "@prisma/client";
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { QueryParams, PaginatedResponse } from "@/types/common";
import { getCached, setCached } from "@/lib/redis";
import { calculatePagination, processActionReturnData } from "@/utils";
import { GetObjectByTParams } from "@/types/extended";
import { ExtendedCustomerSurvey } from "@/types/survey";

// Get survey categories
export async function getSurveyCategories(userId: string, params: QueryParams): Promise<ActionsReturnType<SurveyCategory[]>> {
  const isAuthorized = await verifyPermission({
    userId,
    permissions: {
      dashboard: { canRead: true },
    }
  });

  if (!isAuthorized) {
    return {
      success: false,
      message: "You are not authorized to view survey categories."
    };
  }

  try {
    let categories: SurveyCategory[] | null = await getCached<SurveyCategory[]>("surveyCategories:all");
    const total: number | null = await getCached<number>("surveyCategories:total");
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
      await setCached("surveyCategories:all", categories);
      await setCached("surveyCategories:total", categories.length);
    }

    return {
      success: true,
      data: processActionReturnData(categories) as SurveyCategory[]
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch survey categories"
    };
  }
}

// Create survey category
export async function createSurveyCategory(params: {
  userId: string;
  name: string;
  description?: string;
  question1: string;
  question2: string;
  question3: string;
  question4: string;
}): Promise<ActionsReturnType<SurveyCategory>> {
  const isAuthorized = await verifyPermission({
    userId: params.userId,
    permissions: {
      dashboard: { canRead: true },
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

// Update survey category
export async function updateSurveyCategory(params: {
  userId: string;
  id: string;
  name?: string;
  description?: string;
  question1?: string;
  question2?: string;
  question3?: string;
  question4?: string;
}): Promise<ActionsReturnType<SurveyCategory>> {
  const isAuthorized = await verifyPermission({
    userId: params.userId,
    permissions: {
      dashboard: { canRead: true },
    }
  });

  if (!isAuthorized) {
    return {
      success: false,
      message: "You are not authorized to update survey categories."
    };
  }

  try {
    const category = await prisma.surveyCategory.update({
      where: { id: params.id },
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
      message: error instanceof Error ? error.message : "Failed to update survey category"
    };
  }
}

// Delete survey category (soft delete)
export async function deleteSurveyCategory(params: {
  userId: string;
  id: string;
}): Promise<ActionsReturnType<SurveyCategory>> {
  const isAuthorized = await verifyPermission({
    userId: params.userId,
    permissions: {
      dashboard: { canRead: true },
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

// Get surveys with pagination
export async function getSurveys(
  userId: string,
  params: QueryParams = {}
): Promise<ActionsReturnType<PaginatedResponse<ExtendedCustomerSurvey[]>>> {
  const isAuthorized = await verifyPermission({
    userId,
    permissions: {
      dashboard: { canRead: true },
    }
  });

  if (!isAuthorized) {
    return {
      success: false,
      message: "You are not authorized to view surveys."
    };
  }

  const { skip, take, page } = calculatePagination(params);

  try {
    const [surveys, total] = await prisma.$transaction([
      prisma.customerSatisfactionSurvey.findMany({
        where: params.where,
        include: {
          order: {
            include: { customer: true },
          },
          category: true,
        },
        orderBy: params.orderBy,
        skip,
        take,
      }),
      prisma.customerSatisfactionSurvey.count({ where: params.where })
    ]);

    const lastPage = Math.ceil(total / take);

    return {
      success: true,
      data: {
        data: processActionReturnData(surveys) as ExtendedCustomerSurvey[],
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
      message: error instanceof Error ? error.message : "Failed to fetch surveys"
    };
  }
}

type GenerateSurveyParams = {
  orderId: string
  categoryId: string
}

// Generate survey link
export async function generateSurvey({ orderId, categoryId }: GenerateSurveyParams): Promise<ActionsReturnType<ExtendedCustomerSurvey>> {
  try {
    const category = await prisma.surveyCategory.findUnique({
      where: { 
        id: categoryId,
        isDeleted: false
      },
    });

    if (!category) {
      // Fallback to first available category if specified one not found
      const defaultCategory = await prisma.surveyCategory.findFirst({
        where: { isDeleted: false }
      });

      if (!defaultCategory) {
        return {
          success: false,
          message: "No survey categories found"
        };
      }

      categoryId = defaultCategory.id;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return {
        success: false,
        message: "Order not found"
      };
    }

    const survey = await prisma.customerSatisfactionSurvey.create({
      data: {
        orderId,
        categoryId,
        answers: {}
      },
      include: {
        category: true,
        order: {
          include: {
            customer: true
          }
        }
      }
    });

    return {
      success: true,
      data: processActionReturnData(survey) as ExtendedCustomerSurvey
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate survey"
    };
  }
}

// Submit survey response
export async function submitSurveyResponse(params: {
  surveyId: string;
  answers: Record<string, number>;
  comments?: string;
}): Promise<ActionsReturnType<CustomerSatisfactionSurvey>> {
  try {
    const survey = await prisma.customerSatisfactionSurvey.update({
      where: { id: params.surveyId },
      data: {
        answers: params.answers,
        comments: params.comments,
        submitDate: new Date(),
        metadata: { done: true }
      }
    });

    return {
      success: true,
      data: processActionReturnData(survey) as CustomerSatisfactionSurvey
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to submit survey response"
    };
  }
}

export async function getSurveyById({ surveyId, limitFields}: GetObjectByTParams<"surveyId">): Promise<ActionsReturnType<ExtendedCustomerSurvey>> {
  try {
    const survey = await prisma.customerSatisfactionSurvey.findUnique({
      where: { id: surveyId },
      include: {
        order: {
          include: { 
            customer: true,
            orderItems: {
              include: {
                variant: {
                  include: {
                    product: true,
                  }
                }
              }
            }
          },
        },
        category: true
      }
    });
    
    if (!survey) {
      return {
        success: false,
        message: "Survey not found"
      };
    }
    
    return {
      success: true,
      data: processActionReturnData(survey, limitFields) as ExtendedCustomerSurvey
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch survey"
    };
  }
}