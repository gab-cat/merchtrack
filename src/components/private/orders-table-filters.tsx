"use client";

import { FiFilter } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED'] as const;
const PAYMENT_STATUSES = ['PENDING', 'PAID', 'REFUNDED', 'FAILED'] as const;
const CUSTOMER_TYPES = ['PLAYER', 'STUDENT', 'STAFF_FACULTY', 'ALUMNI', 'OTHERS'] as const;

type OrdersTableFiltersProps = {
  filters: {
    orderStatus: string;
    paymentStatus: string;
    customerType: string;
  };
  onFilterChange: (key: keyof OrdersTableFiltersProps['filters'], value: string) => void;
  onReset: () => void;
};

export function OrdersTableFilters({ filters, onFilterChange, onReset }: Readonly<OrdersTableFiltersProps>) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={filters.orderStatus} onValueChange={(value) => onFilterChange('orderStatus', value)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue defaultValue="PENDING" placeholder="Order Status" />
        </SelectTrigger>
        <SelectContent>
          {ORDER_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.paymentStatus} onValueChange={(value) => onFilterChange('paymentStatus', value)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue defaultValue="PENDING" placeholder="Payment Status" />
        </SelectTrigger>
        <SelectContent>
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