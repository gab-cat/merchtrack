'use client';

import { useState, useMemo, useCallback } from "react";
import { useDebounce } from 'use-debounce';
import { SurveyResponseRow } from "./survey-response-row";
import { SurveyResponseSkeleton } from "./survey-response-skeleton";
import { SearchFilters } from "./search-filters";
import { PaginationFooter } from "./pagination-footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSurveysQuery } from "@/hooks/survey.hooks";
import type { QueryParams } from "@/types/common";

const ITEMS_PER_PAGE = 10;

export function SurveyResponsesList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
  const [debouncedSearch] = useDebounce(searchTerm, 1000);

  const handleDateChange = useCallback((type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    setCurrentPage(1);
  }, []);

  const queryParams = useMemo(() => {
    const params: QueryParams = {
      take: ITEMS_PER_PAGE,
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      page: currentPage,
      orderBy: {
        submitDate: 'desc'
      },
    };

    if (debouncedSearch) {
      params.where = {
        ...params.where,
        OR: [
          { orderId: { contains: debouncedSearch, mode: 'insensitive' } },
          { comments: { contains: debouncedSearch, mode: 'insensitive' } },
          { order: {
            customer: {
              OR: [
                { firstName: { contains: debouncedSearch, mode: 'insensitive' } },
                { lastName: { contains: debouncedSearch, mode: 'insensitive' } }
              ]
            }
          }}
        ]
      };
    }

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.lte = new Date(endDate);
      }
      params.where = {
        ...params.where,
        submitDate: dateFilter
      };
    }

    return params;
  }, [currentPage, debouncedSearch, startDate, endDate]);

  const { data: surveysData, isLoading } = useSurveysQuery(queryParams);
  const totalPages = surveysData?.metadata ? Math.ceil(surveysData.metadata.total / ITEMS_PER_PAGE) : 0;

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle>Survey Responses</CardTitle>
        <SearchFilters 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Survey Category</TableHead>
              <TableHead>Ratings</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Submit Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SurveyResponseSkeleton />
            ) : !surveysData?.data.length ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  No survey responses found
                </TableCell>
              </TableRow>
            ) : (
              surveysData.data.map((survey) => (
                <SurveyResponseRow 
                  key={survey.id} 
                  survey={{
                    ...survey,
                    answers: survey.answers as Record<string, number>
                  }} 
                />
              ))
            )}
          </TableBody>
        </Table>

        <PaginationFooter 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={surveysData?.metadata?.total ?? 0}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </CardContent>
    </Card>
  );
}