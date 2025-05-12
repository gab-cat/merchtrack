import { FC, useState } from "react";
import { BiCheck, BiX, BiRefresh } from "react-icons/bi";
import { Payment } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { refundPayment , validatePayment, rejectPayment } from "@/features/admin/payments/actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { formatCurrency, formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface PaymentsTableProps {
  payments: Payment[];
  orderId: string;
  userId: string;
  onRefund?: () => void;
}

// Define schemas for payment actions
const paymentNoteSchema = z.object({
  note: z.string().optional(),
});

type PaymentNoteFormValues = z.infer<typeof paymentNoteSchema>;

export const PaymentsTable: FC<PaymentsTableProps> = ({ payments, orderId, userId, onRefund }) => {
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [paymentAction, setPaymentAction] = useState<"verify" | "reject" | null>(null);
  
  const queryClient = useQueryClient();
  
  // Initialize the form for payment notes
  const paymentNoteForm = useForm<PaymentNoteFormValues>({
    resolver: zodResolver(paymentNoteSchema),
    defaultValues: {
      note: "",
    },
  });

  const { mutate: processRefund, isPending: isRefunding } = useMutation({
    mutationFn: async ({ amount, reason, paymentId }: { amount: number; reason: string; paymentId?: string }) => {
      const result = await refundPayment({
        amount,
        reason,
        userId,
        paymentId: paymentId ?? ""
      });
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success("Payment refunded successfully");
      onRefund?.();
      setRefundAmount("");
      setRefundReason("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to refund payment");
    }
  });

  // Mutation for verifying a payment
  const { mutate: verifyPayment, isPending: isVerifying } = useMutation({
    mutationFn: async (data: { paymentId: string, note?: string }) => {
      if (!userId) throw new Error("User not authenticated");
      const payment = payments.find(p => p.id === data.paymentId);
      if (!payment) throw new Error("Payment not found");
      
      // Import validatePayment function from actions
      const result = await validatePayment({
        userId,
        orderId,
        transactionDetails: {
          transactionId: payment.transactionId ?? `manual-${Date.now()}`,
          referenceNo: payment.referenceNo ?? "",
          paymentMethod: payment.paymentMethod,
          paymentSite: payment.paymentSite || "OFFSITE",
        },
        paymentId: data.paymentId
      });
      
      if (!result.success) {
        throw new Error(result.message ?? "Failed to verify payment");
      }
      
      return result;
    },
    onSuccess: () => {
      toast.success("Payment verified successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      onRefund?.();
      resetState();
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to verify payment");
    },
  });
  
  // Mutation for rejecting a payment
  const { mutate: rejectPaymentMutation, isPending: isRejecting } = useMutation({
    mutationFn: async (data: { paymentId: string, note: string }) => {
      if (!userId) throw new Error("User not authenticated");
      
      const result = await rejectPayment({
        userId,
        orderId,
        paymentId: data.paymentId,
        rejectionReason: data.note || "Payment rejected by administrator"
      });
      
      if (!result.success) {
        throw new Error(result.message ?? "Failed to reject payment");
      }
      
      return result;
    },
    onSuccess: () => {
      toast.success("Payment rejected successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      onRefund?.();
      resetState();
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to reject payment");
    },
  });
  
  // Helper to reset state after operations
  const resetState = () => {
    setSelectedPaymentId(null);
    setPaymentAction(null);
    paymentNoteForm.reset();
  };
  
  // Handle opening the verify dialog
  const handleVerifyClick = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setPaymentAction("verify");
    paymentNoteForm.reset();
  };
  
  // Handle opening the reject dialog
  const handleRejectClick = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setPaymentAction("reject");
    paymentNoteForm.reset();
  };
  
  // Submit handler for payment actions
  const handlePaymentAction = (data: PaymentNoteFormValues) => {
    if (!selectedPaymentId || !paymentAction) return;
    
    if (paymentAction === "verify") {
      verifyPayment({ 
        paymentId: selectedPaymentId,
        note: data.note 
      });
    } else if (paymentAction === "reject") {
      rejectPaymentMutation({ 
        paymentId: selectedPaymentId,
        note: data.note || "Payment rejected by administrator" 
      });
    }
  };

  const renderRefundButton = () => {
    const totalPaidAmount = payments
      .filter(p => p.paymentStatus === 'VERIFIED')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    if (totalPaidAmount <= 0) return null;
    
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            disabled={isRefunding}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <BiRefresh className="mr-2 size-4" />
            {isRefunding ? "Processing..." : "Issue Refund"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-neutral-2">
          <AlertDialogHeader>
            <AlertDialogTitle>Issue Refund</AlertDialogTitle>
            <AlertDialogDescription>
              Total paid amount: {formatCurrency(totalPaidAmount)}
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="refund-amount" className="text-sm font-medium">Refund Amount</label>
                  <Input
                    id="refund-amount"
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder="Enter refund amount"
                    className="mt-1"
                    max={totalPaidAmount}
                    min={0}
                  />
                </div>
                <div>
                  <label htmlFor="refund-reason" className="text-sm font-medium">Reason for Refund</label>
                  <Textarea
                    id="refund-reason"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Enter reason for refund..."
                    className="mt-1"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setRefundAmount("");
              setRefundReason("");
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const amount = parseFloat(refundAmount);
                if (amount > 0 && amount <= totalPaidAmount && refundReason.trim()) {
                  processRefund({ amount, reason: refundReason });
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={!refundAmount || !refundReason.trim() || parseFloat(refundAmount) <= 0 || parseFloat(refundAmount) > totalPaidAmount}
            >
              Process Refund
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  if (!payments?.length) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground">No payment records found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <div className="mb-4 flex justify-end p-4">
        {renderRefundButton()}
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Date</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.toReversed().map((payment) => (
            <TableRow key={payment.id} className="hover:bg-muted/50">
              <TableCell>{formatDate(payment.createdAt)}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {payment.paymentMethod.toLowerCase()}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(Number(payment.amount) || 0)}
              </TableCell>
              <TableCell>
                <div className={cn(
                  "flex w-fit items-center gap-1.5 rounded-full px-2 py-1",
                  payment.paymentStatus === 'VERIFIED' && "bg-green-50 text-green-700",
                  payment.paymentStatus === 'PENDING' && "bg-yellow-50 text-yellow-700",
                  payment.paymentStatus === 'DECLINED' && "bg-red-50 text-red-700",
                  payment.paymentStatus === 'PROCESSING' && "bg-blue-50 text-blue-700",
                  payment.paymentStatus === 'REFUNDED' && "bg-purple-50 text-purple-700"
                )}>
                  {payment.paymentStatus === 'VERIFIED' && <BiCheck className="size-4" />}
                  {payment.paymentStatus === 'DECLINED' && <BiX className="size-4" />}
                  {payment.paymentStatus === 'REFUNDED' && <BiRefresh className="size-4" />}
                  <span className="text-xs font-medium">{payment.paymentStatus}</span>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {payment.referenceNo || '—'}
              </TableCell>
              <TableCell className="text-right">
                {payment.paymentStatus === 'VERIFIED' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={isRefunding}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <BiRefresh className="mr-2 size-4" />
                        {isRefunding ? "Processing..." : "Refund"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-neutral-2">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Payment Refund</AlertDialogTitle>
                        <AlertDialogDescription>
                          {(() => {
                            const remainingPaymentsCount = payments.filter(p => p.paymentStatus === 'VERIFIED' && p.id !== payment.id).length;
                            return `This action will mark the payment as refunded and change the order status to ${remainingPaymentsCount > 0 ? 'downpayment' : 'pending'}.`;
                          })()}
                          Make sure you have processed the refund in your payment system first.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => processRefund({
                            amount: Number(payment.amount),
                            reason: refundReason || "Payment refunded by administrator",
                            paymentId: payment.id
                          })}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Confirm Refund
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                {payment.paymentStatus === 'PENDING' && (
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleVerifyClick(payment.id)}
                      className="text-green-600 hover:bg-green-50 hover:text-green-700"
                    >
                      <BiCheck className="mr-1 size-4" />
                      Verify
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRejectClick(payment.id)}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <BiX className="mr-1 size-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Payment Action Dialog */}
      <Dialog open={!!selectedPaymentId && !!paymentAction} onOpenChange={(open) => !open && resetState()}>
        <DialogContent className="bg-neutral-2">
          <DialogHeader>
            <DialogTitle>
              {paymentAction === "verify" ? "Verify Payment" : "Reject Payment"}
              {selectedPaymentId && ` - ${payments.find(p => p.id === selectedPaymentId)?.referenceNo || 'Payment'}`}
            </DialogTitle>
            <DialogDescription>
              {paymentAction === "verify" 
                ? "Are you sure you want to verify this payment? This will mark the payment as verified and update the order status."
                : "Are you sure you want to reject this payment? This will mark the payment as declined."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...paymentNoteForm}>
            <form onSubmit={paymentNoteForm.handleSubmit(handlePaymentAction)} className="space-y-4">
              {selectedPaymentId && (
                <div className="grid grid-cols-2 gap-2 rounded-md bg-gray-50 p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Amount</p>
                    <p className="text-sm">
                      {formatCurrency(Number(payments.find(p => p.id === selectedPaymentId)?.amount || 0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Method</p>
                    <p className="text-sm capitalize">
                      {(payments.find(p => p.id === selectedPaymentId)?.paymentMethod || "").toLowerCase().replace('_', ' ')}
                    </p>
                  </div>
                </div>
              )}
              
              <FormField
                control={paymentNoteForm.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {paymentAction === "verify" ? "Verification Notes" : "Rejection Reason"}
                      <span className="text-xs font-normal text-gray-500">
                        {paymentAction === "verify" ? " (optional)" : " (required)"}
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={
                          paymentAction === "verify"
                            ? "Add verification notes if needed"
                            : "Provide a reason for rejecting this payment"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetState}
                  disabled={isVerifying || isRejecting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isVerifying || isRejecting}
                  className={paymentAction === "verify" 
                    ? "bg-primary text-white hover:bg-primary/90" 
                    : "bg-red-600 text-white hover:bg-red-700"}
                >
                  {isVerifying || isRejecting 
                    ? "Processing..." 
                    : (paymentAction === "verify" ? "Verify Payment" : "Reject Payment")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};