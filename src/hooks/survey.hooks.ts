'use client';

import { getSurveyById, getSurveys } from "@/actions/survey.actions";
import { getSurveyCategories } from "@/features/admin/surveys/actions";
import { useResourceByIdQuery, useResourceQuery } from "@/hooks/index.hooks";
import { QueryParams } from "@/types/common";

export function useSurveyCategoriesQuery(params: QueryParams = {}) {
  const { where, include, orderBy, take, skip, page, limit } = params;
  return useResourceQuery({
    resource: 'surveyCategories',
    // @ts-expect-error - This is a workaround to get the correct type for the fetcher function
    fetcher: async (userId: string, params: QueryParams) => getSurveyCategories(userId, params),
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