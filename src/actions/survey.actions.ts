'use server';

import { CustomerSatisfactionSurvey } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { QueryParams, PaginatedResponse } from "@/types/common";
import { calculatePagination, processActionReturnData } from "@/utils";
import { GetObjectByTParams } from "@/types/extended";
import { ExtendedCustomerSurvey } from "@/types/survey";

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
  const { sessionClaims } = await auth();
  const isAuthorized = await verifyPermission({
    userId: sessionClaims?.metadata.data.id as string,
    permissions: {
      messages: { canRead: true, canUpdate: true },
    }
  });

  if (!isAuthorized) {
    return {
      success: false,
      message: "You are not authorized to generate surveys."
    };
  }
  
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