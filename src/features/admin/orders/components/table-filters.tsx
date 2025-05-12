"use client";

import { FiFilter } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'] as const;
const PAYMENT_STATUSES = ['PENDING', 'PAID', 'REFUNDED', 'FAILED'] as const;
const CUSTOMER_TYPES = ['STUDENT', 'TEACHER', 'STAFF', 'GUEST'] as const;

type TableFiltersProps = {
  filters: Readonly<{
    orderStatus: string;
    paymentStatus: string;
    customerType: string;
  }>;
  onFilterChange: (key: keyof TableFiltersProps['filters'], value: string) => void;
  onReset: () => void;
};

export function TableFilters({ filters, onFilterChange, onReset }: Readonly<TableFiltersProps>) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={filters.orderStatus} onValueChange={(value) => onFilterChange('orderStatus', value)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue defaultValue='' placeholder="Order Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {ORDER_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.paymentStatus} onValueChange={(value) => onFilterChange('paymentStatus', value)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Payment Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payments</SelectItem>
          {PAYMENT_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.customerType} onValueChange={(value) => onFilterChange('customerType', value)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Customer Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {CUSTOMER_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button 
        variant="outline" 
        size="icon"
        onClick={onReset}
      >
        <FiFilter className="size-4" />
      </Button>
    </div>
  );
}