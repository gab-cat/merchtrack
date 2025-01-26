import * as React from "react";
import { FaRegEdit } from "react-icons/fa";
import { Role } from "@prisma/client";
import { StatusDropdown } from "./status-dropdown";
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { OrderStatus, PaymentStatus, PaymentMethod, CustomerType } from "@/types/Misc";
import { paymentStatusOptions, orderStatusOptions } from "@/constants";
import { Dialog, DialogHeader, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExtendedOrder } from "@/types/orders";
import { manilaTime } from "@/utils/formatTime";
import { toSentenceCase } from "@/utils";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface OrdersTableRowsProps {
  orders: ExtendedOrder[];
  updateOrder: (id: string, field: keyof ExtendedOrder, value: OrderStatus | PaymentStatus | PaymentMethod | CustomerType) => void;
}

export function OrdersTableRows({ orders, updateOrder }: OrdersTableRowsProps) {
  return (
    orders.map((order) => (
      <TableRow key={order.id}>
        <TableCell>
          <Checkbox className="text-white" />
        </TableCell>
        <TableCell className="flex cursor-pointer flex-row items-center font-bold text-primary-700 underline">
          <Dialog>
            <DialogTrigger>
              <div className="flex items-center">
                <FaRegEdit className="mr-2"/>
                {order.id}
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
