"use client";

import * as React from "react";
import { useState, useEffect } from 'react';
import { FaRegEdit } from "react-icons/fa";
import { DialogClose } from "@radix-ui/react-dialog";
import { StatusDropdown } from "./status-dropdown";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Order, OrderStatus, PaymentStatus, PaymentMethod, CustomerType } from "@/types/Misc";
import { 
  paymentStatusOptions, 
  orderStatusOptions, 
  paymentMethodOptions, 
  customerTypeOptions 
} from "@/constants";
import { Dialog, DialogHeader, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

 
interface OrdersTableProps {
  readonly orders: Order[];
}

export function OrdersTable({ orders: initialOrders }: OrdersTableProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <div>Loading orders...</div>;
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
            <Checkbox className="text-white" />
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
              <Checkbox className="text-white" />
            </TableCell>
            <TableCell className="flex cursor-pointer flex-row items-center font-bold text-primary-700 underline">
              <Dialog>
                <DialogTrigger>
                  <div className="flex items-center">
                    {order.orderNo}
                    <FaRegEdit className="ml-2"/>
                  </div>
                </DialogTrigger> 
                <DialogContent className="bg-neutral-2">
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription className="py-4 text-neutral-6">
                    This action cannot be undone. This will permanently delete your account
                    and remove your data from our servers.
                    </DialogDescription>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button className="cursor-pointer" variant="outline" asChild>
                          <div>Cancel</div>
                        </Button>
                      </DialogClose>
                      <Button className="bg-accent-destructive text-neutral-2">Delete</Button>
                    </DialogFooter>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </TableCell>
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
            <TableCell className="text-right">
              ₱{typeof order.amount === 'number' && !isNaN(order.amount) 
                ? order.amount.toFixed(2) 
                : '0.00'
              }
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

