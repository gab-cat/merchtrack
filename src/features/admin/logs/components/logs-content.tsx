"use client";

import * as React from "react";
import { FaListAlt, FaSearch } from "react-icons/fa";
import { useDebounce } from 'use-debounce';

import { LogsTable, LogDetailsModal } from ".";
import { Input } from "@/components/ui/input";
import { useLogsQuery } from "@/hooks/logs.hooks";
import { DatePicker } from "@/components/ui/date-picker";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ExtendedLogs } from "@/types/logs";
import { QueryParams } from "@/types/common";

const ITEMS_PER_PAGE = 10;

export function LogsContent() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 2000);
  const [startDate, setStartDate] = React.useState<string>();
  const [endDate, setEndDate] = React.useState<string>();
  const [sortBy, setSortBy] = React.useState("newest");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedLog, setSelectedLog] = React.useState<ExtendedLogs | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const queryParams = React.useMemo(() => {
    const params: QueryParams = {
      take: ITEMS_PER_PAGE,
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      where: {
        createdDate: {},
      },
      orderBy: {
        createdDate: sortBy === "newest" ? "desc" : "asc"
      }
    };

    // Add search term filter using debouncedSearch
    if (debouncedSearch) {
      params.where = {
        ...params.where,
        OR: [
          { systemText: { contains: debouncedSearch, mode: 'insensitive' } },
          { userText: { contains: debouncedSearch, mode: 'insensitive' } },
          { reason: { contains: debouncedSearch, mode: 'insensitive' } },
          { user: { 
            OR: [
              { firstName: { contains: debouncedSearch, mode: 'insensitive' } },
              { lastName: { contains: debouncedSearch, mode: 'insensitive' } }
            ]
          }},
          { createdBy: {
            OR: [
              { firstName: { contains: debouncedSearch, mode: 'insensitive' } },
              { lastName: { contains: debouncedSearch, mode: 'insensitive' } }
            ]
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
        createdDate: dateFilter
      };
    }

    return params;
  }, [currentPage, debouncedSearch, startDate, endDate, sortBy]);

  // Reset page when search or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, startDate, endDate, sortBy]);

  React.useEffect(() => {
    const handleStartDateChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setStartDate(customEvent.detail.value);
      setCurrentPage(1);
    };

    const handleEndDateChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setEndDate(customEvent.detail.value);
      setCurrentPage(1);
    };

    window.addEventListener('datechange:start-date', handleStartDateChange);
    window.addEventListener('datechange:end-date', handleEndDateChange);

    return () => {
      window.removeEventListener('datechange:start-date', handleStartDateChange);
      window.removeEventListener('datechange:end-date', handleEndDateChange);
    };
  }, []);

  const { data: logsData, isLoading } = useLogsQuery(queryParams);

  const logs = logsData?.data;
  const metadata = logsData?.metadata;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleRowClick = (log: ExtendedLogs) => {
    setSelectedLog(log);
    setModalOpen(true);
  };

  if (!logs?.length && !isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-gray-500">
        <FaListAlt className="mb-2 size-8" />
        <p>No logs found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by user, action, or details..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DatePicker 
              name="start-date"
              initialValue={startDate} 
              placeholder="Start date" 
            />
            <span>to</span>
            <DatePicker 
              name="end-date"
              initialValue={endDate} 
              placeholder="End date" 
            />
          </div>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <LogsTable 
        logs={logs}
        isLoading={isLoading}
        onLogClick={handleRowClick}
      />

      {metadata && metadata.total > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-muted-foreground text-sm">
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, metadata.total)}-
            {Math.min(currentPage * ITEMS_PER_PAGE, metadata.total)} of {metadata.total} entries
          </div>
          <Pagination
            page={metadata.page}
            total={metadata.lastPage}
            onChange={setCurrentPage}
            hasNextPage={metadata.hasNextPage}
            hasPrevPage={metadata.hasPrevPage}
          />
        </div>
      )}

      <LogDetailsModal 
        log={selectedLog}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}