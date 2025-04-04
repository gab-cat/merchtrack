import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PaymentMethod, PaymentSite } from '@prisma/client';
import { useOrderQuery } from '@/hooks/orders.hooks';
import { useUserStore } from '@/stores/user.store';
import { processPayment } from '@/actions/payments.actions';
import { formatCurrency } from '@/utils/format';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Role } from '@/types/Misc';
import useToast from '@/hooks/use-toast';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
  onPaymentComplete: () => void;
}

const paymentFormSchema = z.object({
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'GCASH', 'MAYA', 'OTHERS'] as const, {
    required_error: 'Please select a payment method',
  }),
  paymentSite: z.enum(['ONSITE', 'OFFSITE'] as const, {
    required_error: 'Please select a payment site',
  }),
  paymentType: z.enum(['FULL', 'DOWNPAYMENT'] as const, {
    required_error: 'Please select a payment type',
  }),
  customAmount: z.number().optional(),
  referenceNo: z.string().optional(),
  transactionId: z.string().optional(),
  paymentProvider: z.string().optional(),
  memo: z.string().max(500, 'Note cannot exceed 500 characters').optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

// Payment details constants
const PAYMENT_DETAILS = {
  ONSITE: {
    title: "On-site Payment Location",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
        <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
        <path d="M12 14h.01" />
      </svg>
    ),
    details: [
      { label: "Office", value: "PIXELS Office / Gold in Blue" },
      { label: "Location", value: "Santos Building, 3rd Floor Hallway" },
      { label: "Campus", value: "Ateneo de Naga University Campus" },
      { label: "Hours", value: "Mon-Fri, 9am-5pm" }
    ],
    note: {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 mt-0.5 size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
      title: "Important:",
      message: "Payment locations may vary. Please check with our Facebook Page for the latest updates. "
    },
    colorClasses: {
      border: "border-primary/20",
      bg: "bg-primary",
      noteBg: "bg-primary/10",
      noteText: "text-primary"
    }
  },
  BANK_TRANSFER: {
    title: "Bank Transfer Details",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="8" width="18" height="12" rx="2" />
        <rect x="7" y="4" width="10" height="4" rx="1" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="8" y1="16" x2="16" y2="16" />
      </svg>
    ),
    details: [
      { label: "Bank", value: "Bank of the Philippine Islands (BPI)" },
      { label: "Account Name", value: "Deanna Jolie Ramos" },
      { label: "Account Number", value: "0639478226" },
      { label: "Reference Format", value: "[Your Order ID]" }
    ],
    note: {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 mt-0.5 size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
      title: "Important:",
      message: "Please include your Order ID in the payment reference to help us identify your payment. After payment, email your screenshot to payments@merchtrack.tech with your Order ID as the subject."
    },
    colorClasses: {
      border: "border-rose-100",
      bg: "bg-rose-600",
      noteBg: "bg-rose-50",
      noteText: "text-rose-700"
    }
  },
  GCASH: {
    title: "GCash Details",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
        <path d="M12 12v4" />
        <path d="M8 16h8" />
      </svg>
    ),
    details: [
      { label: "GCash Number", value: "09936167562" },
      { label: "Account Name", value: "Deanna Jolie Ramos" },
      { label: "Reference Format", value: "[Your Order ID]" }
    ],
    note: {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 mt-0.5 size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      title: "Processing Time:",
      message: "Please include your Order ID in the payment reference to help us identify your payment. After payment, email your screenshot to payments@merchtrack.tech with your Order ID as the subject."
    },
    colorClasses: {
      border: "border-blue-100",
      bg: "bg-blue-600",
      noteBg: "bg-blue-50",
      noteText: "text-blue-700"
    }
  },
  MAYA: {
    title: "Maya Details",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.34 4.86A2 2 0 0 1 5 4h14a2 2 0 0 1 1.64.86c.17.25.26.55.26.86v12.28A2 2 0 0 1 19 20H5a2 2 0 0 1-1.66-.86c-.16-.26-.25-.56-.24-.87V5.71c0-.3.1-.6.25-.86Z" />
        <path d="M16 8.99H8" />
        <path d="M16 4v6" />
        <path d="M12 4v6" />
        <path d="M8 4v6" />
        <path d="M8 18h8" />
      </svg>
    ),
    details: [
      { label: "Maya Number", value: "[To be added...]" },
      { label: "Account Name", value: "[To be added...]" },
      { label: "Reference Format", value: "[Your Order ID]" }
    ],
    note: {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 mt-0.5 size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 9V5c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v4" />
          <path d="M2 13v6c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2v-6" />
          <path d="M2 9h20" />
          <path d="M2 13h20" />
        </svg>
      ),
      title: "Verification Process:",
      message: "Maya Payments are not available at this time. Please stay tuned for further announcements. Kindly use other payment methods for now."
    },
    colorClasses: {
      border: "border-green-100",
      bg: "bg-green-600",
      noteBg: "bg-green-50",
      noteText: "text-green-700"
    }
  }
};

export function PaymentDialog({ open, onOpenChange, orderId, onPaymentComplete }: Readonly<PaymentDialogProps>) {
  const { userId } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<PaymentSite>('ONSITE');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const toast = useToast;
  
  const { data: orderData, isLoading } = useOrderQuery(orderId ?? '');
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentMethod: undefined,
      paymentSite: 'ONSITE',
      paymentType: 'FULL',
      customAmount: undefined,
      referenceNo: '',
      transactionId: '',
      paymentProvider: '',
      memo: '',
    },
  });

  const paymentType = form.watch('paymentType');
  
  const order = orderData;
  const remainingAmount = order ? 
    Number(order.totalAmount) - 
    (order.payments
      ?.filter(payment => payment.paymentStatus === 'VERIFIED')
      ?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0)
    : 0;

  // Update payment amount whenever the payment type changes
  useEffect(() => {
    if (paymentType === 'FULL') {
      setPaymentAmount(remainingAmount);
    } else {
      // For downpayment, use the custom amount or default to 0
      const customAmount = form.getValues('customAmount');
      setPaymentAmount(customAmount ?? 0);
    }
  }, [paymentType, remainingAmount, form]);

  // When custom amount changes, update payment amount
  const handleCustomAmountChange = (value: number) => {
    form.setValue('customAmount', value);
    setPaymentAmount(value);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as PaymentSite);
    form.setValue('paymentSite', value as PaymentSite);
  };

  const onSubmit = async (data: PaymentFormValues) => {
    if (!userId || !orderId || !order) {
      toast({
        type: "error",
        title: 'Payment submission failed',
        message: 'Unable to process payment. Please try again later.',
      });
      return;
    }

    // Validate payment amount
    if (data.paymentType === 'DOWNPAYMENT' && (!data.customAmount || data.customAmount <= 0)) {
      toast({
        type: "error",
        title: 'Invalid payment amount',
        message: 'Please enter a valid downpayment amount.',
      });
      return;
    }

    if (data.paymentType === 'DOWNPAYMENT' && data.customAmount && data.customAmount > remainingAmount) {
      toast({
        type: "error",
        title: 'Invalid payment amount',
        message: `Downpayment amount cannot exceed the remaining balance of ${formatCurrency(remainingAmount)}.`,
      });
      return;
    }

    // Determine final payment amount
    const finalAmount = data.paymentType === 'FULL' ? remainingAmount : (data.customAmount ?? 0);
    
    if (finalAmount <= 0) {
      toast({
        type: "error",
        title: 'Invalid payment amount',
        message: 'Payment amount must be greater than zero.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const result = await processPayment({
        userId: userId,
        orderId: orderId,
        amount: finalAmount,
        paymentMethod: data.paymentMethod,
        paymentSite: data.paymentSite,
        paymentStatus: 'PENDING',
        referenceNo: data.referenceNo ?? '',
        transactionId: data.transactionId,
        paymentProvider: data.paymentProvider,
        memo: data.memo,
      });
      
      if (result.success) {
        onPaymentComplete();
        toast({
          type: "success",
          title: 'Payment submitted successfully!',
          message: 'Your payment is being processed. Please wait for confirmation. You will be notified via email once verified.',
          duration: 5,
        });
      } else {
        toast({
          type: "error",
          title: 'Payment submission failed',
          message: result.message ?? 'Please try again later.',
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        type: "error",
        title: 'Payment submission failed',
        message: 'An error occurred while processing your payment. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPaymentDetails = (paymentMethod: 'ONSITE' | 'BANK_TRANSFER' | 'GCASH' | 'MAYA') => {
    const details = PAYMENT_DETAILS[paymentMethod];
    return (
      <Card className={`mb-4 overflow-hidden border ${details.colorClasses.border}`}>
        <div className={`${details.colorClasses.bg} p-3`}>
          <h3 className="flex items-center font-medium text-white">
            {details.icon}
            {details.title}
          </h3>
        </div>
        <div className="p-4">
          <div className="overflow-hidden rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="divide-y divide-gray-200 bg-white">
                {details.details.map((detail, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900">
                      {detail.label}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {detail.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className={`mt-3 flex items-start rounded-md ${details.colorClasses.noteBg} p-3 text-sm ${details.colorClasses.noteText}`}>
            {details.note.icon}
            <div>
              <p className="font-medium">{details.note.title}</p>
              <p>{details.note.message}</p>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderBankDetails = () => renderPaymentDetails('BANK_TRANSFER');
  const renderGCashDetails = () => renderPaymentDetails('GCASH');
  const renderMayaDetails = () => renderPaymentDetails('MAYA');

  const getPaymentMethodDetails = (method: PaymentMethod) => {
    switch (method) {
    case 'BANK_TRANSFER':
      return renderBankDetails();
    case 'GCASH':
      return renderGCashDetails();
    case 'MAYA':
      return renderMayaDetails();
    default:
      return null;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderOnsiteInstructions = () => renderPaymentDetails('ONSITE');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-neutral-2 sm:max-w-[600px]">
        <DialogHeader className='bg-neutral-2'>
          <DialogTitle className='font-bold text-primary'>Complete Your Payment</DialogTitle>
          <DialogDescription>
            Provide payment details for your order. After submission, our team will verify your payment.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner size="lg" />
            <span className="ml-2">Loading order details...</span>
          </div>
        ) : !order ? (
          <div className="py-4 text-center text-red-600">
            Order not found or unable to load order details
          </div>
        ) : (
          <>
            {/* Order Summary */}
            <div className="mb-4 rounded-lg border border-primary/75 bg-primary-100 p-4">
              <div className="flex justify-between">
                <span className="font-medium text-neutral-7">Order ID:</span>
                <span className='font-semibold text-primary'>{orderId}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="font-medium">Total Amount:</span>
                <span>{formatCurrency(Number(order.totalAmount))}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="font-medium">Amount Due:</span>
                <span className="font-semibold text-orange-600">{formatCurrency(remainingAmount)}</span>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <Tabs
                  value={activeTab}
                  onValueChange={handleTabChange}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    {/* <TabsTrigger value="ONSITE">On-site Payment</TabsTrigger> */}
                    <TabsTrigger value="OFFSITE">Off-site Payment</TabsTrigger>
                  </TabsList>
                  
                  {/* <TabsContent value="ONSITE" className="py-2">
                    {renderOnsiteInstructions()}
                  </TabsContent> */}
                  
                  <TabsContent value="OFFSITE" className="space-y-4 py-2">
                    {/* Payment Type Selection */}
                    <FormField
                      control={form.control}
                      name="paymentType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Payment Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="FULL" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Full Payment ({formatCurrency(remainingAmount)})
                                </FormLabel>
                              </FormItem>
                              {order.customer.role === Role.PLAYER && (<FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="DOWNPAYMENT" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Downpayment (Enter amount)
                                </FormLabel>
                              </FormItem>)}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Custom Amount Input (only shown for downpayment) */}
                    {paymentType === 'DOWNPAYMENT' && (
                      <FormField
                        control={form.control}
                        name="customAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter amount"
                                value={field.value?.toString() ?? ''}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  if (!isNaN(value)) {
                                    handleCustomAmountChange(value);
                                  } else {
                                    handleCustomAmountChange(0);
                                  }
                                }}
                                min={1}
                                max={remainingAmount}
                                step={0.01}
                                required
                              />
                            </FormControl>
                            <FormDescription>
                              Minimum downpayment amount: {formatCurrency(remainingAmount * 0.1)}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                      <p className="font-medium">Payment Amount: {formatCurrency(paymentAmount)}</p>
                      <p>This amount will be processed upon verification.</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue('paymentMethod', value as PaymentMethod);
                            }}
                            
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                              <SelectItem value="GCASH">GCash</SelectItem>
                              <SelectItem value="MAYA">Maya</SelectItem>
                              <SelectItem value="OTHERS">Others</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {getPaymentMethodDetails(form.watch('paymentMethod'))}
                    
                    <FormField
                      control={form.control}
                      name="referenceNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference Number*</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter reference number" {...field} required />
                          </FormControl>
                          <FormDescription>
                            The transaction reference number from your payment receipt
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="transactionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter transaction ID (if available)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paymentProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Provider</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter payment provider (e.g., bank name)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
                
                {activeTab === "OFFSITE" && (<FormField
                  control={form.control}
                  name="memo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional information about your payment"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />)}

                <DialogFooter>
                  {activeTab == "OFFSITE" && (<Button 
                    type="submit" 
                    disabled={isSubmitting || (paymentType === 'DOWNPAYMENT' && (!form.getValues('customAmount') || (form.getValues('customAmount')! <= 0)))}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="mr-2" /> Processing...
                      </>
                    ) : (
                      'Submit Payment'
                    )}
                  </Button>)}
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}