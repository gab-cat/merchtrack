/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Payment } from "@prisma/client";
import { format } from "date-fns";
import { FaMoneyBillWave, FaCheck, FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface OffsitePaymentProps {
  payments: Payment[];
  isLoading: boolean;
  onVerify: (paymentId: string, notes: string) => Promise<void>;
  onReject: (paymentId: string, notes: string) => Promise<void>;
}

const notesSchema = z.object({
  notes: z.string().optional(),
});

type NotesFormValues = z.infer<typeof notesSchema>;

export function OffsitePayment({ payments, isLoading, onVerify, onReject }: Readonly<OffsitePaymentProps>) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [dialogType, setDialogType] = useState<"verify" | "reject" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NotesFormValues>({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      notes: "",
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

    setIsSubmitting(true);
    try {
      if (dialogType === "verify") {
        await onVerify(selectedPayment.id, data.notes ?? "");
      } else {
        await onReject(selectedPayment.id, data.notes ?? "");
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Error processing payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="flex items-center gap-2">
          <FaMoneyBillWave className="animate-pulse text-primary" />
          <p className="text-sm text-gray-500">Loading payments...</p>
        </div>
      </div>
    );
  }

  const pendingPayments = payments?.filter(
    (payment) => payment.paymentStatus === "PENDING" && payment.paymentSite === "OFFSITE"
  );

  const getButtonLabel = () => {
    if (isSubmitting) return "Processing...";
    return dialogType === "verify" ? "Verify Payment" : "Reject Payment";
  };

  return (
    <>
      {pendingPayments && pendingPayments.length > 0 ? (
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {pendingPayments.map((payment) => (
              <div
                key={payment.id}
                onClick={() => handlePaymentClick(payment)}
                className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order #{payment.orderId}</p>
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
                  <div className="flex gap-2">
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
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex h-[300px] items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-center">
            <FaMoneyBillWave className="size-8 text-gray-400" />
            <p className="text-sm text-gray-500">No pending offsite payments to verify</p>
          </div>
        </div>
      )}

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
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
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
