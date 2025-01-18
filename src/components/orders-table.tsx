"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusDropdown } from "./status-dropdown";
import { Order, OrderStatus, PaymentStatus, PaymentMethod, CustomerType } from "@/types/Misc";
import { 
  paymentStatusOptions, 
  orderStatusOptions, 
  paymentMethodOptions, 
  customerTypeOptions 
} from "@/constants/status-options";

interface OrdersTableProps {
  orders: Order[]
}

export function OrdersTable({ orders: initialOrders }: OrdersTableProps) {
  const [orders, setOrders] = React.useState(initialOrders);

  const updateOrder = (id: string, field: keyof Order, value: OrderStatus | PaymentStatus | PaymentMethod | CustomerType) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, [field]: value } : order
    ));
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox />
          </TableHead>
          <TableHead>Order No.</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Customer Name</TableHead>
          <TableHead>Customer Type</TableHead>
          <TableHead>Payment Status</TableHead>
          <TableHead>Payment Method</TableHead>
          <TableHead>Order Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <Checkbox />
            </TableCell>
            <TableCell>{order.orderNo}</TableCell>
            <TableCell>{order.date}</TableCell>
            <TableCell>{order.customerName}</TableCell>
            <TableCell>
              <StatusDropdown
                options={customerTypeOptions}
                value={order.customerType}
                onChange={(value) => updateOrder(order.id, "customerType", value as CustomerType)}
                align="start"
              />
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
                options={paymentMethodOptions}
                value={order.paymentMethod}
                onChange={(value) => updateOrder(order.id, "paymentMethod", value as PaymentMethod)}
                align="start"
              />
            </TableCell>
            <TableCell>
              <StatusDropdown
                options={orderStatusOptions}
                value={order.orderStatus}
                onChange={(value) => updateOrder(order.id, "orderStatus", value as OrderStatus)}
                align="start"
              />
            </TableCell>
            <TableCell className="text-right">₱{order.amount.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

