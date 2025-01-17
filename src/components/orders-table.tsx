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

// Define the correct type for the options
type StatusOption = {
  label: string;
  value: string;
  variant: "default" | "outline" | undefined;
  className: string;
};

const paymentStatusOptions: StatusOption[] = [
  { label: "Paid", value: "paid", variant: "outline", className: "border-green-500 text-green-500 bg-green-50" },
  { label: "Partially Paid", value: "partially_paid", variant: "outline", className: "border-yellow-500 text-yellow-500 bg-yellow-50" },
  { label: "Unpaid", value: "unpaid", variant: "outline", className: "border-red-500 text-red-500 bg-red-50" },
  { label: "Refunded", value: "refunded", variant: "outline", className: "border-blue-500 text-blue-500 bg-blue-50" },
];

const orderStatusOptions: StatusOption[] = [
  { label: "Pending", value: "pending", variant: "outline", className: "border-purple-500 text-purple-500 bg-purple-50" },
  { label: "Confirmed", value: "confirmed", variant: "outline", className: "border-blue-500 text-blue-500 bg-blue-50" },
  { label: "Unfulfilled", value: "unfulfilled", variant: "outline", className: "border-yellow-500 text-yellow-500 bg-yellow-50" },
  { label: "Fulfilled", value: "fulfilled", variant: "outline", className: "border-green-500 text-green-500 bg-green-50" },
  { label: "Canceled", value: "canceled", variant: "outline", className: "border-red-500 text-red-500 bg-red-50" },
];

const paymentMethodOptions: StatusOption[] = [
  { label: "Onsite", value: "onsite", variant: undefined, className: "bg-green-600" },
  { label: "Offsite", value: "offsite", variant: undefined, className: "bg-blue-600" },
];

const customerTypeOptions: StatusOption[] = [
  { label: "Student (COCS)", value: "student_cocs", variant: "outline", className: "border-blue-500 text-blue-500 bg-blue-50" },
  { label: "Student (Other)", value: "student_other", variant: "outline", className: "border-blue-500 text-blue-500 bg-blue-50" },
  { label: "Teacher", value: "teacher", variant: "outline", className: "border-purple-500 text-purple-500 bg-purple-50" },
  { label: "Athlete (COCS)", value: "athlete_cocs", variant: "outline", className: "border-green-500 text-green-500 bg-green-50" },
  { label: "Alumni (COCS)", value: "alumni_cocs", variant: "outline", className: "border-red-500 text-red-500 bg-red-50" },
  { label: "Other", value: "other", variant: "outline", className: "border-orange-500 text-orange-500 bg-orange-50" },
];

interface Order {
  id: string;
  orderNo: string;
  date: string;
  customerName: string;
  customerType: string;
  paymentStatus: string;
  paymentMethod: string;
  orderStatus: string;
  amount: number;
}

export function OrdersTable({ orders: initialOrders }: { orders: Order[] }) {
  const [orders, setOrders] = React.useState(initialOrders);

  const updateOrder = (id: string, field: keyof Order, value: string) => {
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
                onChange={(value) => updateOrder(order.id, "customerType", value)}
                align="start"
              />
            </TableCell>
            <TableCell>
              <StatusDropdown
                options={paymentStatusOptions}
                value={order.paymentStatus}
                onChange={(value) => updateOrder(order.id, "paymentStatus", value)}
                align="start"
              />
            </TableCell>
            <TableCell>
              <StatusDropdown
                options={paymentMethodOptions}
                value={order.paymentMethod}
                onChange={(value) => updateOrder(order.id, "paymentMethod", value)}
                align="start"
              />
            </TableCell>
            <TableCell>
              <StatusDropdown
                options={orderStatusOptions}
                value={order.orderStatus}
                onChange={(value) => updateOrder(order.id, "orderStatus", value)}
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
