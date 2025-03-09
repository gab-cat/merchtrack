"use client";

import React from "react";
import { PaymentStatus, PaymentSite } from "@prisma/client";
import { BiSearch } from "react-icons/bi";
import { FaMoneyBill } from "react-icons/fa";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrdersPaymentTable } from "./orders-payment-table";
import { OffsitePayment } from "./offsite-payment";
import { TransactionHistory } from "@/app/admin/payments/components/transaction-history";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrdersQuery } from "@/hooks/orders.hooks";
import { usePaymentsQuery } from "@/hooks/payments.hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { validatePayment, rejectPayment } from "@/actions/payments.actions";
import { useUserStore } from "@/stores/user.store";

export function PaymentsContent() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchField, setSearchField] = React.useState("orderNo");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null);
  const itemsPerPage = 10;
  const { userId } = useUserStore();
  const queryClient = useQueryClient();

  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

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

  // Query specifically for pending offsite payments
  const { data: offsitePaymentsResponse, isLoading: isOffsitePaymentsLoading } = usePaymentsQuery({
    where: {
      isDeleted: false,
      paymentStatus: PaymentStatus.PENDING,
      paymentSite: PaymentSite.OFFSITE
    }
  });

  // Effect to handle URL orderId parameter
  React.useEffect(() => {
    if (orderId && orders?.data) {
      const order = orders.data.find(o => o.id === orderId);
      if (order) {
        setSelectedOrderId(orderId);
      }
    }
  }, [orderId, orders?.data]);

  // Cleanup effect when modal is closed
  const handleModalClose = () => {
    setSelectedOrderId(null);
    // Remove orderId from URL without page refresh
    const newUrl = window.location.pathname;
    router.replace(newUrl);
  };

  const totalPages = Math.ceil((orders?.data?.length ?? 0) / itemsPerPage);

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

  // Mutation for verifying payments
  const { mutate: verifyPaymentMutation } = useMutation({
    mutationFn: async ({ paymentId }: { paymentId: string; notes: string }) => {
      if (!userId) throw new Error("User not authenticated");
      
      const payment = offsitePaymentsResponse?.data?.find(p => p.id === paymentId);
      if (!payment) throw new Error("Payment not found");

      const result = await validatePayment(
        userId,
        payment.orderId,
        Number(payment.amount),
        {
          transactionId: payment.transactionId ?? `manual-${Date.now()}`,
          referenceNo: payment.referenceNo ?? "",
          paymentMethod: payment.paymentMethod,
          paymentSite: payment.paymentSite,
        },
        paymentId // Add the paymentId parameter here
      );

      if (!result.success) {
        throw new Error(result.message ?? "Failed to verify payment");
      }

      return result;
    },
    onSuccess: () => {
      toast.success("Payment verified successfully");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to verify payment");
    },
  });

  // Mutation for rejecting payments
  const { mutate: rejectPaymentMutation } = useMutation({
    mutationFn: async ({ paymentId, notes }: { paymentId: string; notes: string }) => {
      if (!userId) throw new Error("User not authenticated");
      
      const payment = offsitePaymentsResponse?.data?.find(p => p.id === paymentId);
      if (!payment) throw new Error("Payment not found");

      const result = await rejectPayment(
        userId,
        payment.orderId,
        paymentId,
        notes ?? "Payment rejected by administrator"
      );

      if (!result.success) {
        throw new Error(result.message ?? "Failed to reject payment");
      }

      return result;
    },
    onSuccess: () => {
      toast.success("Payment rejected successfully");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to reject payment");
    },
  });

  const handleVerifyPayment = async (paymentId: string, notes: string) => {
    verifyPaymentMutation({ paymentId, notes });
  };

  const handleRejectPayment = async (paymentId: string, notes: string) => {
    rejectPaymentMutation({ paymentId, notes });
  };

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
            selectedOrderId={selectedOrderId}
            onOrderSelect={setSelectedOrderId}
            onModalClose={handleModalClose}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="space-y-6">
        {/* Offsite Payments */}
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Offsite Payments</h2>
            <Badge className="bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
              {offsitePaymentsResponse?.data?.length ?? 0} pending
            </Badge>
          </div>
          <OffsitePayment 
            payments={offsitePaymentsResponse?.data ?? []} 
            isLoading={isOffsitePaymentsLoading}
            onVerify={handleVerifyPayment}
            onReject={handleRejectPayment}
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