import * as React from "react";
import { OrderPaymentStatus } from "@prisma/client";
import { FaListAlt, FaRegClock } from "react-icons/fa";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { motion } from "framer-motion";
import { OrderPaymentModal } from "@/features/admin/payments/components";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { manilaTime } from "@/utils/formatTime";
import { ExtendedOrder } from "@/types/orders";
import { Button } from "@/components/ui/button";
import { fadeInUp } from "@/constants/animations";
import { PaginationFooter } from "@/components/shared/pagination-footer";

interface OrdersPaymentTableProps {
  orders?: ExtendedOrder[];
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedOrderId: string | null;
  onOrderSelect: (orderId: string) => void;
  onModalClose: () => void;
  totalItems: number;
}

export function OrdersPaymentTable({ 
  orders, 
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  selectedOrderId,
  onOrderSelect,
  onModalClose,
  totalItems
}: Readonly<OrdersPaymentTableProps>) {
  const [parent] = useAutoAnimate();
  const selectedOrder = selectedOrderId ? orders?.find(o => o.id === selectedOrderId) || null : null;
  
  const handleOrderClick = (order: ExtendedOrder) => {
    onOrderSelect(order.id);
  };
  
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <FaRegClock className="mr-2 size-5 animate-spin" />
        Loading orders...
      </div>
    );
  }
  
  if (!orders?.length) {
    return (
      <motion.div {...fadeInUp} className="flex min-h-[400px] flex-col items-center justify-center text-gray-500">
        <FaListAlt className="mb-2 size-8" />
        <p>No pending orders found</p>
      </motion.div>
    );
  }
  
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order No.</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Payment Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody ref={parent}>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Button
                  variant="outline"
                  onClick={() => handleOrderClick(order)}
                  className="border text-xs font-medium text-primary hover:border-primary hover:bg-primary-100"
                >
                  {order.id}
                </Button>
              </TableCell>
              <TableCell>{manilaTime.dateTime(order.orderDate)}</TableCell>
              <TableCell>{`${order.customer.firstName} ${order.customer.lastName}`}</TableCell>
              <TableCell>₱{Number(order.totalAmount).toFixed(2)}</TableCell>
              <TableCell>
                <span className={cn(
                  "rounded-full px-2 py-1 text-xs font-semibold",
                  order.paymentStatus === OrderPaymentStatus.PENDING && "bg-yellow-100 text-yellow-800",
                  order.paymentStatus === OrderPaymentStatus.DOWNPAYMENT && "bg-purple-100 text-purple-800",
                  order.paymentStatus === OrderPaymentStatus.PAID && "bg-green-100 text-green-800",
                  order.paymentStatus === OrderPaymentStatus.REFUNDED && "bg-red-100 text-red-800",
                )}>
                  {order.paymentStatus}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <PaginationFooter 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={totalItems}
        itemsPerPage={10}
      />
      
      <OrderPaymentModal
        order={selectedOrder}
        open={!!selectedOrderId}
        onOpenChange={(open) => {
          if (!open) onModalClose();
        }}
      />
    </>
  );
}