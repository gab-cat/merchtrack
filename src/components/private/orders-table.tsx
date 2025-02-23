"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { OrdersTableSkeleton } from "./orders-table-skeleton";
import { OrdersTableRows } from "./orders-table-rows";
import { OrdersTableHeader } from "./orders-table-header";
import { OrdersTableFilters } from "./orders-table-filters";
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import type { OrderStatus, PaymentStatus, PaymentMethod, CustomerType } from "@/types/Misc";
import type { ExtendedOrder } from "@/types/orders";
import { useOrdersQuery } from "@/hooks/orders.hooks";
import { useDebouncedValue } from "@/hooks";
import { SearchInput } from "@/components/ui/search-input";
import { PaginationFooter } from "@/app/admin/survey/components/pagination-footer";

const ITEMS_PER_PAGE = 10;

type OrderFilters = {
  orderStatus: string;
  paymentStatus: string;
  customerType: string;
};

export function OrdersTable() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filters, setFilters] = React.useState<OrderFilters>({
    orderStatus: "",
    paymentStatus: "",
    customerType: ""
  });
  const router = useRouter();
  
  const debouncedSearch = useDebouncedValue(searchTerm, 500);
  const debouncedFilters = useDebouncedValue(filters, 500);

  const queryParams = React.useMemo(() => ({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    orderBy: {
      createdAt: "desc" as const
    },
    where: {
      AND: [
        ...(debouncedSearch ? [{
          OR: [
            { id: { contains: debouncedSearch, mode: 'insensitive' } },
            { customer: { 
              OR: [
                { firstName: { contains: debouncedSearch, mode: 'insensitive' } },
                { lastName: { contains: debouncedSearch, mode: 'insensitive' } },
                { email: { contains: debouncedSearch, mode: 'insensitive' } }
              ]
            }},
          ]
        }] : []),
        ...(debouncedFilters.orderStatus ? [{ status: debouncedFilters.orderStatus }] : []),
        ...(debouncedFilters.paymentStatus ? [{ paymentStatus: debouncedFilters.paymentStatus }] : []),
        ...(debouncedFilters.customerType ? [{ customer: { role: debouncedFilters.customerType } }] : [])
      ]
    }
  }), [currentPage, debouncedSearch, debouncedFilters]);

  const { data: orders, isLoading } = useOrdersQuery(queryParams);

  const handleFilterChange = (key: keyof OrderFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleOrderUpdate = (id: string, field: keyof ExtendedOrder, value: OrderStatus | PaymentStatus | PaymentMethod | CustomerType) => {
    orders?.data.map(order => 
      order.id === id ? { ...order, [field]: value } : order
    );
  };

  const resetFilters = () => {
    setFilters({
      orderStatus: "",
      paymentStatus: "",
      customerType: ""
    });
    setSearchTerm("");
    setCurrentPage(1); // Reset to first page when filters are reset
  };

  const totalPages = orders?.metadata ? Math.ceil(orders.metadata.total / ITEMS_PER_PAGE) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput 
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search orders..."
        />

        <OrdersTableFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <OrdersTableHeader />
          {isLoading ? (
            <TableBody>
              <OrdersTableSkeleton />
            </TableBody>
          ) : (
            <motion.tbody
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}>
              <OrdersTableRows router={router} orders={orders?.data as ExtendedOrder[]} updateOrder={handleOrderUpdate} />
            </motion.tbody>
          )}
        </Table>
      </div>

      {totalPages > 0 && (
        <PaginationFooter
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={orders?.metadata?.total ?? 0}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

