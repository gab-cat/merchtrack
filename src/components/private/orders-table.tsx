"use client";

import * as React from "react";
import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { OrdersTableSkeleton } from "./orders-table-skeleton";
import { OrdersTableRows } from "./orders-table-rows";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead as TableHeadCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { OrderStatus, PaymentStatus, PaymentMethod, CustomerType } from "@/types/Misc";
import { getAllOrders } from "@/actions/orders.actions";
import useToast from "@/hooks/use-toast";
import { ExtendedOrder } from "@/types/orders";
import { useUserStore } from "@/stores/user.store";

export function OrdersTable() {
  const { userId } = useUserStore();
  const { data: ordersData, isLoading } = useQuery<ExtendedOrder[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const { success, data, message } = await getAllOrders(userId as string);
      if (!success) {
        useToast({
          type: "error",
          message: message ?? "An error occurred while fetching orders.",
          title: 'Something went wrong',
        });
        throw new Error(message);
      }
      return data ?? [];
    },
  });

  const [orders, setOrders] = useState<ExtendedOrder[]>([]);

  useEffect(() => {
    if (ordersData) {
      setOrders(ordersData);
    }
  }, [ordersData]);

  const updateOrder = (id: string, field: keyof ExtendedOrder, value: OrderStatus | PaymentStatus | PaymentMethod | CustomerType) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, [field]: value } : order
    ));
  };

  return (
    <Table>
      <TableHeader> 
        <TableRow className="font-bold">
          <TableHeadCell className="w-12">
            <Checkbox className="text-white" />
          </TableHeadCell>
          <TableHeadCell className="font-bold">Order No.</TableHeadCell>
          <TableHeadCell className="font-bold">Date</TableHeadCell>
          <TableHeadCell className="font-bold">Name</TableHeadCell>
          <TableHeadCell className="font-bold">Type</TableHeadCell>
          <TableHeadCell className="font-bold">Payment Status</TableHeadCell>
          <TableHeadCell className="font-bold">Order Status</TableHeadCell>
          <TableHeadCell className="text-right font-bold">Amount</TableHeadCell>
        </TableRow>
      </TableHeader>

      
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
          <OrdersTableRows orders={orders} updateOrder={updateOrder} />
        </motion.tbody>
      )}
      
    </Table>
  );
}

