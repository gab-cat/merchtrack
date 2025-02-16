'use client';

import { getLogs } from "@/actions/logs.actions";
import { useResourceQuery } from "@/hooks/index.hooks";
import { QueryParams } from "@/types/common";

export function useLogsQuery(params: QueryParams = {}) {
  const { where, include, orderBy, take = 10, skip, page } = params;
  
  return useResourceQuery({
    resource: "logs",
    fetcher: (userId: string, params: QueryParams) => getLogs({ userId, params }),
    params: {
      where,
      include,
      orderBy,
      take,
      skip,
      page
    }
  });
}