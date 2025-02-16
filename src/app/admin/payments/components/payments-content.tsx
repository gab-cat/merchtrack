"use client";

import React from "react";
import { PaymentStatus } from "@prisma/client";
import { BiSearch } from "react-icons/bi";
import { FaMoneyBill } from "react-icons/fa";
import { OrdersPaymentTable } from "./orders-payment-table";
import { OffsitePayment } from "./offsite-payment";
import { TransactionHistory } from "@/app/admin/payments/components/transaction-history";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrdersQuery } from "@/hooks/orders.hooks";
import { usePaymentsQuery } from "@/hooks/payments.hooks";
import { Button } from "@/components/ui/button";

export function PaymentsContent() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchField, setSearchField] = React.useState("orderNo");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const { data: orders, isLoading } = useOrdersQuery({
    where: {
      isDeleted: false,
      paymentStatus: { in: ["PENDING", "DOWNPAYMENT"] },
    },
  });

  const { data: paymentsResponse, isLoading: isPaymentsLoading } = usePaymentsQuery({
    take: 10,
    orderBy: { createdAt: 'desc' },
    where: {
      isDeleted: false,
      paymentStatus: {
        in: [PaymentStatus.VERIFIED, PaymentStatus.PENDING]
      }
    }
  });

  const totalPages = Math.ceil((orders?.data.length || 0) / itemsPerPage);

  const filteredOrders = React.useMemo(() => {
    if (!orders?.data || !searchQuery) return orders?.data;

    return orders.data.filter(order => {
      const searchValue = searchQuery.toLowerCase();
      switch (searchField) {
      case "orderNo":
        return order.id.toLowerCase().includes(searchValue);
      case "email":
        return order.customer.email.toLowerCase().includes(searchValue);
      case "name":
        return `${order.customer.firstName} ${order.customer.lastName}`
          .toLowerCase()
          .includes(searchValue);
      default:
        return true;
      }
    });
  }, [orders?.data, searchQuery, searchField]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Select value={searchField} onValueChange={setSearchField}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Search by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="orderNo">Order Number</SelectItem>
              <SelectItem value="email">Customer Email</SelectItem>
              <SelectItem value="name">Customer Name</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <BiSearch className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="rounded-lg border bg-white">
          <OrdersPaymentTable 
            orders={filteredOrders} 
            isLoading={isLoading} 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="space-y-6">
        {/* Offsite Payments */}
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Offsite Payments</h2>
          </div>
          <OffsitePayment 
            payments={[]} 
            onConfirm={(payment) => {
              console.log('Confirm payment:', payment);
            }}
            onReject={(payment) => {
              console.log('Reject payment:', payment);
            }}
          />
        </div>

        {/* Recent Transactions */}
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <Button variant="outline" size="sm">
              <FaMoneyBill className="mr-2 size-4" />
              Export
            </Button>
          </div>
          <TransactionHistory 
            payments={paymentsResponse?.data} 
            isLoading={isPaymentsLoading}
          />
        </div>
      </div>
    </div>
  );
}