/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Payment, User, PaymentStatus, PaymentSite } from "@prisma/client";
import { format } from "date-fns";
import { FaMoneyBillWave, FaCheck, FaTimes, FaSearch } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PaginationFooter } from "@/components/shared/pagination-footer";
import { usePaymentsQuery } from "@/hooks/payments.hooks";

type OffsitePaymentProps = {
  payments: (Payment & { user: User })[];
  isLoading: boolean;
  onVerify: (paymentId: string, notes: string) => Promise<void>;
  onReject: (paymentId: string, notes: string) => Promise<void>;
}

const notesSchema = z.object({
  notes: z.string().optional(),
});

type NotesFormValues = z.infer<typeof notesSchema>;

export function OffsitePayment({ isLoading: initialLoading, onVerify, onReject }: Readonly<OffsitePaymentProps>) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [dialogType, setDialogType] = useState<"verify" | "reject" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const form = useForm<NotesFormValues>({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      notes: "",
    },
  });

  // Create a query specifically for filtered offsite payments
  const { data: filteredPayments, isLoading, refetch } = usePaymentsQuery({
    limit: itemsPerPage,
    take: itemsPerPage,
    where: {
      isDeleted: false,
      paymentStatus: PaymentStatus.PENDING,
      paymentSite: PaymentSite.OFFSITE,
      // @ts-expect-error - type of OR is not needed to be strict
      OR: debouncedSearchQuery ? [
        { user: { firstName: { contains: debouncedSearchQuery, mode: 'insensitive' } } },
        { user: { lastName: { contains: debouncedSearchQuery, mode: 'insensitive' } } },
        { referenceNo: { contains: debouncedSearchQuery, mode: 'insensitive' } },
        { orderId: { contains: debouncedSearchQuery, mode: 'insensitive' } }
      ] : undefined
    }
  });

  // Use the queried data instead of the prop data
  const paymentsToUse = (filteredPayments?.data) as (Payment & { user: User })[];
  const isLoadingToUse = isLoading || initialLoading;

  const { mutate: verifyPayment, isPending: isVerifying } = useMutation({
    mutationKey: ['payments:all', 'orders:all'],  
    mutationFn: async ({ paymentId, notes }: { paymentId: string; notes: string }) => {
      return onVerify(paymentId, notes);
    },
    onSuccess: () => {
      handleCloseDialog();
      queryClient.invalidateQueries({queryKey: ['payments:all', 'orders:all']});
      refetch();
    },
    onError: () => {
      queryClient.invalidateQueries({queryKey: ['payments:all', 'orders:all']});
    }
  });

  const { mutate: rejectPayment, isPending: isRejecting } = useMutation({
    mutationKey: ['payments:all'],  
    mutationFn: async ({ paymentId, notes }: { paymentId: string; notes: string }) => {
      return onReject(paymentId, notes);
    },
    onSuccess: () => {
      handleCloseDialog();
      queryClient.invalidateQueries({ queryKey: ['payments:all', 'orders:all'] });
      refetch();
    },
  });

  const handlePaymentClick = (payment: Payment) => {
    setSelectedPayment(payment);
  };

  const handleOpenVerifyDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setDialogType("verify");
    form.reset();
  };

  const handleOpenRejectDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setDialogType("reject");
    form.reset();
  };

  const handleCloseDialog = () => {
    setSelectedPayment(null);
    setDialogType(null);
  };

  const onSubmit = async (data: NotesFormValues) => {
    if (!selectedPayment || !dialogType) return;

    if (dialogType === "verify") {
      verifyPayment({ paymentId: selectedPayment.id, notes: data.notes ?? "" });
    } else {
      rejectPayment({ paymentId: selectedPayment.id, notes: data.notes ?? "" });
    }
  };

  if (isLoadingToUse) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="flex items-center gap-2">
          <FaMoneyBillWave className="animate-pulse text-primary" />
          <p className="text-sm text-gray-500">Loading payments...</p>
        </div>
      </div>
    );
  }


  const getButtonLabel = () => {
    if (isVerifying || isRejecting) return "Processing...";
    return dialogType === "verify" ? "Verify Payment" : "Reject Payment";
  };

  return (
    <>
      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="Search by name, order ID or reference number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4"
        />
        <FaSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary/70" />
      </div>
      
      <div className="min-h-[300px]">
        {paymentsToUse && paymentsToUse.length > 0 ? (
          <>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {filteredPayments?.data.map((payment) => (
                  <div
                    key={payment.id}
                    onClick={() => handlePaymentClick(payment)}
                    className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{payment.user.firstName} {payment.user.lastName}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(payment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {payment.paymentMethod.toLowerCase().replace('_', ' ')}
                          </Badge>
                          <span className="text-sm font-medium text-emerald-600">
                            ₱{Number(payment.amount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenVerifyDialog(payment);
                          }}
                        >
                          <FaCheck className="mr-1 size-3" /> Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenRejectDialog(payment);
                          }}
                        >
                          <FaTimes className="mr-1 size-3" /> Reject
                        </Button>
                      </div>
                    </div>
                    {payment.memo && (
                      <div className="mt-2 text-sm text-gray-500">
                        <p className="font-medium">Notes:</p>
                        <p>{payment.memo}</p>
                      </div>
                    )}
                    {payment.referenceNo && (
                      <div className="mt-1 text-sm">
                        <span className="font-medium text-gray-700">Reference:</span>{" "}
                        <span className="text-gray-600">{payment.referenceNo}</span>
                      </div>
                    )}
                    <div className="mt-1 text-sm">
                      <span className="font-medium text-gray-700">Order ID:</span>{" "}
                      <span className="text-gray-600">{payment.orderId}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Pagination Footer */}
            <PaginationFooter
              currentPage={currentPage}
              totalPages={filteredPayments?.metadata?.lastPage ?? 1}
              totalItems={filteredPayments?.metadata?.total ?? 0}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="flex h-[300px] items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-center">
              <FaMoneyBillWave className="size-8 text-primary opacity-70" />
              <p className="text-sm text-gray-500">No matching payments found</p>
              {debouncedSearchQuery && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-primary hover:text-primary/90"
                >
                  Clear search
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!selectedPayment && !!dialogType} onOpenChange={handleCloseDialog}>
        <DialogContent className="bg-neutral-2">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "verify" ? "Verify Payment" : "Reject Payment"} - Order #{selectedPayment?.orderId}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 rounded-md bg-gray-50 p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Amount</p>
                    <p className="text-sm">₱{Number(selectedPayment?.amount || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Payment Method</p>
                    <p className="text-sm capitalize">{selectedPayment?.paymentMethod?.toLowerCase().replace('_', ' ')}</p>
                  </div>
                  {selectedPayment?.referenceNo && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-700">Reference</p>
                      <p className="text-sm">{selectedPayment.referenceNo}</p>
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Additional Notes{" "}
                        <span className="text-xs font-normal text-gray-500">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            dialogType === "verify"
                              ? "Add verification notes if needed"
                              : "Add reason for rejection"
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={isVerifying || isRejecting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isVerifying || isRejecting}
                  className={
                    dialogType === "verify"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }
                >
                  {getButtonLabel()}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
