'use client';

import { getSurveyById, getSurveyCategories, getSurveys } from "@/actions/survey.actions";
import { useResourceByIdQuery, useResourceQuery } from "@/hooks/index.hooks";
import { QueryParams } from "@/types/common";

export function useSurveyCategoriesQuery(params: QueryParams = {}) {
  const { where, include, orderBy, take, skip, page, limit } = params;
  return useResourceQuery({
    resource: 'surveyCategories',
    fetcher: async (userId: string, params: QueryParams) => {
      const response = await getSurveyCategories(userId, params);
      return {
        success: response.success,
        data: {
          data: response.data || [],
          metadata: {
            total: response.data?.length ?? 0,
            page: 1,
            lastPage: 1,
            hasNextPage: false,
            hasPrevPage: false
          }
        }
      };
    },
    params: {
      where: {
        isDeleted: false,
        ...where
      },
      include,
      orderBy,
      take,
      skip,
      page,
      limit
    }

  });
}

export function useSurveysQuery(params: QueryParams = {}) {
  const { where, include, orderBy, take = 12, skip, page, limit } = params;
  return useResourceQuery({
    resource: 'surveys',
    fetcher: (userId: string, params: QueryParams) => getSurveys(userId, params),
    params: {
      where: {
        ...where
      },
      include,
      orderBy,
      take,
      skip,
      page,
      limit
    }
  });
}

export function useSurveyQuery(surveyId: string, limitFields: string[] = []) {
  return useResourceByIdQuery({
    resource: 'surveys',
    identifier: surveyId,
    params: { limitFields },
    fetcher: (userId: string, id: string, params: QueryParams) =>
      getSurveyById({ userId, surveyId: id , limitFields: params.limitFields })
  });
}