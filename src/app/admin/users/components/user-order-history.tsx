"use client";

import React, { useState, useMemo } from "react";
import { useDebounce } from "use-debounce";
import { FaSearch, FaShoppingBag, FaExternalLinkAlt, FaClock, FaBox, FaShippingFast, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Link from "next/link";
import { format } from "date-fns";
import { useOrdersQuery } from "@/hooks/orders.hooks";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryParams } from "@/types/common";


interface UserOrderHistoryProps {
  email: string;
}

const ITEMS_PER_PAGE = 10;

export function UserOrderHistory({ email }: UserOrderHistoryProps) {
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
        customer: { email: decodeURIComponent(email) },
        isDeleted: false
      }
    };

    if (debouncedSearch) {
      params.where = {
        ...params.where,
        OR: [
          { id: { contains: debouncedSearch, mode: 'insensitive' } },
          { notes: { contains: debouncedSearch, mode: 'insensitive' } }
        ]
      };
    }

    if (statusFilter !== "ALL") {
      params.where = {
        ...params.where,
        status: statusFilter
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

  const { data: ordersData, isLoading } = useOrdersQuery(queryParams);

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

  const getOrderStatusBadge = (status: string) => {
    const statusColors: Record<string, { color: string; bgColor: string }> = {
      PENDING: { color: "text-yellow-800", bgColor: "bg-yellow-100" },
      PROCESSING: { color: "text-blue-800", bgColor: "bg-blue-100" },
      SHIPPED: { color: "text-green-800", bgColor: "bg-green-100" },
      DELIVERED: { color: "text-purple-800", bgColor: "bg-purple-100" },
      CANCELLED: { color: "text-red-800", bgColor: "bg-red-100" },
    };

    const style = statusColors[status] || { color: "text-gray-800", bgColor: "bg-gray-100" };
    return <Badge className={`${style.bgColor} ${style.color}`}>{status}</Badge>;
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
    case "PENDING":
      return <FaClock className="size-4 text-yellow-500" />;
    case "PROCESSING":
      return <FaBox className="size-4 text-blue-500" />;
    case "SHIPPED":
      return <FaShippingFast className="size-4 text-purple-500" />;
    case "DELIVERED":
      return <FaCheckCircle className="size-4 text-green-500" />;
    case "CANCELLED":
      return <FaTimesCircle className="size-4 text-red-500" />;
    default:
      return null;
    }
  };

  if (!ordersData?.data?.length && !isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-gray-500">
        <FaShoppingBag className="mb-2 size-8" />
        <p>No orders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-none shadow-md">
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <FaShoppingBag className="size-5" />
            Order History
          </h3>
          <p className="mt-1 text-sm text-purple-100">
            View and manage customer orders
          </p>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search orders..."
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
                  <FaClock className="size-4 text-yellow-500" />
                  Pending
                </SelectItem>
                <SelectItem value="PROCESSING" className="flex items-center gap-2">
                  <FaBox className="size-4 text-blue-500" />
                  Processing
                </SelectItem>
                <SelectItem value="SHIPPED" className="flex items-center gap-2">
                  <FaShippingFast className="size-4 text-purple-500" />
                  Shipped
                </SelectItem>
                <SelectItem value="DELIVERED" className="flex items-center gap-2">
                  <FaCheckCircle className="size-4 text-green-500" />
                  Delivered
                </SelectItem>
                <SelectItem value="CANCELLED" className="flex items-center gap-2">
                  <FaTimesCircle className="size-4 text-red-500" />
                  Cancelled
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
            <OrdersSkeleton />
          ) : (
            <div className="space-y-4">
              {ordersData?.data.map((order) => (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-lg border transition-all hover:shadow-md"
                >
                  <div className="border-b bg-gray-50/50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getOrderStatusIcon(order.status)}
                        <p className="font-medium text-gray-900">Order #{order.id}</p>
                        {getOrderStatusBadge(order.status)}
                      </div>
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          <FaExternalLinkAlt className="mr-2 size-3" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-gray-500">Order Date</p>
                        <p className="font-medium">
                          {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Items</p>
                        <p className="font-medium">{order.orderItems?.length || 0} items</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-medium text-green-600">₱{Number(order.totalAmount).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      {ordersData?.metadata && ordersData.metadata.total > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
            {Math.min(currentPage * ITEMS_PER_PAGE, ordersData.metadata.total)} of {ordersData.metadata.total} entries
          </div>
          <PaginationNav
            currentPage={currentPage}
            totalPages={ordersData.metadata.lastPage}
            totalItems={ordersData.metadata.total}
            onPageChange={setCurrentPage}
            showTotalItems={false}
          />
        </div>
      )}
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-48" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}