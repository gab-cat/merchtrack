"use client";

import React, { useState, useEffect } from "react";
import { PaymentStatus, PaymentSite } from "@prisma/client";
import { BiSearch } from "react-icons/bi";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { OrdersPaymentTable , OffsitePayment , OrderPaymentModalWithQueryParams } from "@/features/admin/payments/components";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrdersQuery } from "@/hooks/orders.hooks";
import { usePaymentsQuery } from "@/hooks/payments.hooks";
import { Badge } from "@/components/ui/badge";
import { validatePayment, rejectPayment } from "@/features/admin/payments/actions";
import { useUserStore } from "@/stores/user.store";

export function PaymentsContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("orderNo");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const itemsPerPage = 10;
  const { userId } = useUserStore();
  const queryClient = useQueryClient();

  // Use debounced search to prevent too many queries
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  // Build query parameters based on search field and term
  const queryWhereClause = React.useMemo(() => {
    const baseWhere = {
      isDeleted: false,
      paymentStatus: { in: ["PENDING", "DOWNPAYMENT"] },
    };

    if (!debouncedSearchQuery) return baseWhere;

    switch (searchField) {
    case "orderNo":
      return {
        ...baseWhere,
        id: { contains: debouncedSearchQuery, mode: 'insensitive' }
      };
    case "email":
      return {
        ...baseWhere,
        customer: { email: { contains: debouncedSearchQuery, mode: 'insensitive' } }
      };
    case "name":
      return {
        ...baseWhere,
        customer: { 
          OR: [
            { firstName: { contains: debouncedSearchQuery, mode: 'insensitive' } },
            { lastName: { contains: debouncedSearchQuery, mode: 'insensitive' } }
          ]
        }
      };
    default:
      return baseWhere;
    }
  }, [debouncedSearchQuery, searchField]);

  // Query orders with pagination and search
  const { data: orders, isLoading, refetch: orderRefetch } = useOrdersQuery({
    where: queryWhereClause,
    page: currentPage,
    take: itemsPerPage,
    skip: (currentPage - 1) * itemsPerPage,
    orderBy: {
      createdAt: 'desc'
    }
  });


  const refetchData = () => {
    orderRefetch();
    paymentsRefetch();
  };

  // Query specifically for pending offsite payments
  const { data: offsitePaymentsResponse, isLoading: isOffsitePaymentsLoading, refetch: paymentsRefetch } = usePaymentsQuery({
    where: {
      isDeleted: false,
      paymentStatus: PaymentStatus.PENDING,
      paymentSite: PaymentSite.OFFSITE
    }
  });

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, searchField]);

  // Effect to handle URL orderId parameter for manual selection (separate from the auto modal)
  useEffect(() => {
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

  // Calculate total pages from metadata
  const totalItems = orders?.metadata?.total ?? 0;
  const totalPages = orders?.metadata?.lastPage ?? 1;

  // Mutation for verifying payments
  const { mutate: verifyPaymentMutation } = useMutation({
    mutationFn: async ({ paymentId }: { paymentId: string; notes: string }) => {
      if (!userId) throw new Error("User not authenticated");
      
      const payment = offsitePaymentsResponse?.data?.find(p => p.id === paymentId);
      if (!payment) throw new Error("Payment not found");

      const result = await validatePayment({
        userId,
        orderId: payment.orderId,
        paymentId,
        transactionDetails: {
          transactionId: payment.transactionId ?? `manual-${Date.now()}`,
          referenceNo: payment.referenceNo ?? "",
          paymentMethod: payment.paymentMethod,
          paymentSite: payment.paymentSite,
        }
      });

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

      const result = await rejectPayment({
        userId,
        orderId: payment.orderId,
        paymentId,
        rejectionReason: notes ?? "Payment rejected by administrator"
      });

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
    refetchData();
  };

  const handleRejectPayment = async (paymentId: string, notes: string) => {
    rejectPaymentMutation({ paymentId, notes });
    refetchData();
  };

  return (
    <>
      {/* Auto-opening modal when orderId is in URL params */}
      <OrderPaymentModalWithQueryParams />
      
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
              orders={orders?.data || []} 
              isLoading={isLoading} 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              selectedOrderId={selectedOrderId}
              onOrderSelect={setSelectedOrderId}
              onModalClose={handleModalClose}
              totalItems={totalItems}
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              payments={offsitePaymentsResponse?.data ?? [] as any[]} 
              isLoading={isOffsitePaymentsLoading}
              onVerify={handleVerifyPayment}
              onReject={handleRejectPayment}
            />
          </div>
        </div>
      </div>
    </>
  );
}