/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { FaSearch, FaListAlt, FaUser, FaTag, FaClock, FaCog, FaShoppingBag, FaCreditCard } from "react-icons/fa";
import { format } from "date-fns";
import { LogDetailsModal } from "../../../../features/admin/logs/components/log-details-modal";
import { useLogsQuery } from "@/hooks/logs.hooks";
import { PaginationNav } from "@/components/pagination-nav";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExtendedLogs } from "@/types/logs";
import { QueryParams } from "@/types/common";

interface UserActivityLogsProps {
  email: string;
}

const ITEMS_PER_PAGE = 10;

export function UserActivityLogs({ email }: UserActivityLogsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 1000);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('desc');
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
  const [selectedLog, setSelectedLog] = useState<ExtendedLogs | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const queryParams = useMemo(() => {
    const params: QueryParams = {
      take: ITEMS_PER_PAGE,
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      page: currentPage,
      orderBy: {
        createdDate: sortBy
      },
      where: {
        OR: [
          { user: {
            email: decodeURIComponent(email)
          } },
          { createdBy: {
            email: decodeURIComponent(email)
          } }
        ]
      }
    };

    if (debouncedSearch) {
      params.where = {
        ...params.where,
        OR: [
          { systemText: { contains: debouncedSearch, mode: 'insensitive' } },
          { userText: { contains: debouncedSearch, mode: 'insensitive' } },
          { reason: { contains: debouncedSearch, mode: 'insensitive' } }
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
  }, [email, currentPage, debouncedSearch, sortBy, startDate, endDate]);

  useEffect(() => {
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

  const handleLogClick = (log: ExtendedLogs) => {
    setSelectedLog(log);
    setModalOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
    case 'user':
      return <FaUser className="size-4 text-blue-500" />;
    case 'system':
      return <FaCog className="size-4 text-purple-500" />;
    case 'order':
      return <FaShoppingBag className="size-4 text-green-500" />;
    case 'payment':
      return <FaCreditCard className="size-4 text-yellow-500" />;
    default:
      return <FaTag className="size-4 text-gray-500" />;
    }
  };

  const getCategoryBadgeStyle = (category: string) => {
    switch (category.toLowerCase()) {
    case 'user':
      return 'bg-blue-50 text-blue-700';
    case 'system':
      return 'bg-purple-50 text-purple-700';
    case 'order':
      return 'bg-green-50 text-green-700';
    case 'payment':
      return 'bg-yellow-50 text-yellow-700';
    default:
      return 'bg-gray-50 text-gray-700';
    }
  };

  if (!logsData?.data?.length && !isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-gray-500">
        <FaListAlt className="mb-2 size-8" />
        <p>No activity logs found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-none shadow-md">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <FaListAlt className="size-5" />
            Activity Logs
          </h3>
          <p className="mt-1 text-sm text-indigo-100">
            Track user activities and system events
          </p>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
              <span className="text-gray-500">to</span>
              <DatePicker 
                name="end-date"
                initialValue={endDate}
                placeholder="End date"
              />
            </div>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'asc' | 'desc')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="border-none p-4 shadow-md">
        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <LogsSkeleton />
          ) : (
            <div className="space-y-4">
              {logsData?.data.map((log) => (
                <div
                  key={log.id}
                  className="overflow-hidden rounded-lg border transition-all hover:cursor-pointer hover:shadow-md"
                  onClick={() => handleLogClick(log)}
                >
                  <div className="border-b bg-gray-50/50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(log.reason)}
                        <Badge variant="secondary" className={`flex items-center gap-1 ${getCategoryBadgeStyle(log.reason)}`}>
                          {log.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FaClock className="size-4" />
                        {format(new Date(log.createdDate), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-gray-900">{log.userText || log.systemText}</p>
                    {log.reason && (
                      <p className="mt-2 text-sm text-gray-500">{log.reason}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                      <FaUser className="size-3" />
                      <span>
                        by {log.createdBy.firstName} {log.createdBy.lastName}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      {logsData?.metadata && logsData.metadata.total > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
            {Math.min(currentPage * ITEMS_PER_PAGE, logsData.metadata.total)} of {logsData.metadata.total} entries
          </div>
          <PaginationNav
            currentPage={currentPage}
            totalPages={logsData.metadata.lastPage}
            totalItems={logsData.metadata.total}
            onPageChange={setCurrentPage}
            showTotalItems={false}
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

function LogsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-1/2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}