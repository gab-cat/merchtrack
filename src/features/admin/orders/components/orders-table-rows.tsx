import * as React from "react";
import { FaRegEdit } from "react-icons/fa";
import { Role } from "@prisma/client";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { StatusDropdown } from "@/features/admin/orders/components";
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { OrderStatus, PaymentStatus, PaymentMethod, CustomerType } from "@/types/Misc";
import { paymentStatusOptions, orderStatusOptions } from "@/constants";
import { Button } from "@/components/ui/button";
import { ExtendedOrder } from "@/types/orders";
import { manilaTime } from "@/utils/formatTime";
import { toSentenceCase } from "@/utils";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface OrdersTableRowsProps {
  orders: ExtendedOrder[];
  updateOrder: (id: string, field: keyof ExtendedOrder, value: OrderStatus | PaymentStatus | PaymentMethod | CustomerType) => void;
  router: AppRouterInstance;
}

export function OrdersTableRows({ orders, updateOrder, router }: OrdersTableRowsProps) {
  return (
    orders?.map((order) => (
      <TableRow key={order.id}>
        <TableCell>
          <Checkbox className="text-white" />
        </TableCell>
        <TableCell className="flex cursor-pointer flex-row items-center font-bold text-primary-700 underline">
          <Button variant='outline'
            onClick={() => router.push(`/admin/orders/${order.id}`)}
            className="flex items-center">
            <FaRegEdit className="mr-2"/>
            {order.id}
          </Button>
        </TableCell>
        <TableCell>{manilaTime.dateTime(order.createdAt)}</TableCell>
        <TableCell>{order.customer.firstName} {order.customer.lastName}</TableCell>
        <TableCell className="text-xs">
          <span className={cn("rounded-xl border border-primary-500 bg-primary/10 px-2 py-1 text-xs font-bold text-primary-500",
            order.customer.role === Role.STUDENT && 'border-blue-500 text-blue-500 bg-blue-50',
            order.customer.role === Role.STAFF_FACULTY && 'border-purple-500 text-purple-500 bg-purple-50',
            order.customer.role === Role.OTHERS && 'border-orange-500 text-orange-500 bg-orange-50',
            order.customer.role === Role.PLAYER && 'border-green-500 text-green-500 bg-green-50',
            order.customer.role === Role.ALUMNI && 'border-red-500 text-red-500 bg-red-50',
          )}>{toSentenceCase(order.customer.role)}</span>
        </TableCell>
        <TableCell>
          <StatusDropdown
            options={paymentStatusOptions}
            value={order.paymentStatus}
            onChange={(value) => updateOrder(order.id, "paymentStatus", value as PaymentStatus)}
            align="start"
          />
        </TableCell>
        <TableCell>
          <StatusDropdown
            options={orderStatusOptions}
            value={order.status}
            onChange={(value) => updateOrder(order.id, "status", value as OrderStatus)}
            align="start"
          />
        </TableCell>
        <TableCell className="text-right">
            ₱{typeof order.totalAmount === 'number' && !isNaN(order.totalAmount) 
            ? order.totalAmount.toFixed(2) 
            : '0.00'
          }
        </TableCell>
      </TableRow>
    ))
  );
}
