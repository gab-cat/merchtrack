"use client";

import React, { useState, useMemo } from "react";
import { useDebounce } from "use-debounce";
import { PaymentStatus } from "@prisma/client";
import { FaSearch, FaMoneyBill, FaCheck, FaClock, FaTimes, FaFileInvoiceDollar, FaCreditCard } from "react-icons/fa";
import { format } from "date-fns";
import { usePaymentsQuery } from "@/hooks/payments.hooks";
import { PaginationNav } from "@/components/pagination-nav";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryParams } from "@/types/common";
import { DatePicker } from "@/components/ui/date-picker";


interface UserPaymentHistoryProps {
  email: string;
}

const ITEMS_PER_PAGE = 10;

export function UserPaymentHistory({ email }: UserPaymentHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 1000);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'desc' | 'asc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();

  const queryParams = useMemo(() => {
    const params: QueryParams = {
      take: ITEMS_PER_PAGE,
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      page: currentPage,
      orderBy: {
        createdAt: sortBy
      },
      where: {
        order: { customer: { email: decodeURIComponent(email) } },
        isDeleted: false
      }
    };

    if (debouncedSearch) {
      params.where = {
        ...params.where,
        OR: [
          { orderId: { contains: debouncedSearch, mode: 'insensitive' } },
          { referenceNo: { contains: debouncedSearch, mode: 'insensitive' } }
        ]
      };
    }

    if (statusFilter !== "ALL") {
      params.where = {
        ...params.where,
        paymentStatus: statusFilter as PaymentStatus
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
        createdAt: dateFilter
      };
    }

    return params;
  }, [email, currentPage, debouncedSearch, sortBy, statusFilter, startDate, endDate]);

  const { data: paymentsData, isLoading } = usePaymentsQuery(queryParams);

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

  const getPaymentStatusIcon = (status: PaymentStatus) => {
    switch (status) {
    case PaymentStatus.VERIFIED:
      return <FaCheck className="size-4 text-green-600" />;
    case PaymentStatus.PENDING:
      return <FaClock className="size-4 text-yellow-600" />;
    case PaymentStatus.REFUNDED:
      return <FaTimes className="size-4 text-red-600" />;
    default:
      return null;
    }
  };

  const getStatusBadgeStyles = (status: PaymentStatus) => {
    switch (status) {
    case PaymentStatus.VERIFIED:
      return "bg-green-100 text-green-800";
    case PaymentStatus.PENDING:
      return "bg-yellow-100 text-yellow-800";
    case PaymentStatus.REFUNDED:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
    }
  };

  if (!paymentsData?.data?.length && !isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-gray-500">
        <FaMoneyBill className="mb-2 size-8" />
        <p>No payments found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-none shadow-md">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <FaCreditCard className="size-5" />
            Payment History
          </h3>
          <p className="mt-1 text-sm text-emerald-100">
            Track and manage payment transactions
          </p>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by order ID or reference..."
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING" className="flex items-center gap-2">
                  <FaClock className="size-4 text-yellow-600" />
                  Pending
                </SelectItem>
                <SelectItem value="VERIFIED" className="flex items-center gap-2">
                  <FaCheck className="size-4 text-green-600" />
                  Verified
                </SelectItem>
                <SelectItem value="REFUNDED" className="flex items-center gap-2">
                  <FaTimes className="size-4 text-red-600" />
                  Refunded
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'desc' | 'asc')}>
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
            <PaymentsSkeleton />
          ) : (
            <div className="space-y-4">
              {paymentsData?.data.map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <FaFileInvoiceDollar className="size-5 text-emerald-500" />
                        <p className="font-medium text-gray-900">
                          Order #{payment.orderId}
                        </p>
                        <Badge 
                          variant="secondary" 
                          className={`flex items-center gap-1 ${getStatusBadgeStyles(payment.paymentStatus)}`}
                        >
                          {getPaymentStatusIcon(payment.paymentStatus)}
                          {payment.paymentStatus}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <span className="font-medium">Ref: {payment.referenceNo}</span>
                        <span>•</span>
                        <span className="font-medium text-emerald-600">₱{Number(payment.amount).toFixed(2)}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <FaClock className="size-3" />
                          <span>{format(new Date(payment.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                      </div>
                    </div>
                    {payment.memo && (
                      <div className="text-sm text-gray-500">
                        <p className="font-medium text-gray-700">Memo:</p>
                        <p>{payment.memo}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      {paymentsData?.metadata && paymentsData.metadata.total > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
            {Math.min(currentPage * ITEMS_PER_PAGE, paymentsData.metadata.total)} of {paymentsData.metadata.total} entries
          </div>
          <PaginationNav
            currentPage={currentPage}
            totalPages={paymentsData.metadata.lastPage}
            totalItems={paymentsData.metadata.total}
            onPageChange={setCurrentPage}
            showTotalItems={false}
          />
        </div>
      )}
    </div>
  );
}

function PaymentsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}