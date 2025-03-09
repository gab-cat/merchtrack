import { Loader2 } from "lucide-react";
import { FiShoppingBag, FiCalendar, FiAlertTriangle } from "react-icons/fi";
import { format } from "date-fns";
import { type UseFormReturn } from "react-hook-form";
import { FormSection } from "./form-section";
import { OrderItem } from "./order-items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CreateOrderType } from "@/schema/orders.schema";
import useToast from "@/hooks/use-toast";

// Subcomponents to reduce complexity
function PricingSummary({ 
  totalAmount, 
  discountAmount, 
  finalAmount, 
  discountPercentage, 
  onDiscountChange,
  disabled 
}: Readonly<{
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  discountPercentage: string;
  onDiscountChange: (value: string) => void;
  disabled?: boolean;
}>) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="discount">Discount Amount</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            id="discount"
            value={discountAmount}
            onChange={(e) => onDiscountChange(e.target.value)}
            className="w-32 text-right"
            min={0}
            max={totalAmount}
            disabled={disabled}
          />
          <Badge variant="secondary">{discountPercentage}%</Badge>
        </div>
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Subtotal</span>
        <span>{totalAmount.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Discount</span>
        <span className="text-red-600">-{discountAmount.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between font-bold">
        <span>Final Amount</span>
        <span className="text-lg">{finalAmount.toFixed(2)}</span>
      </div>
    </div>
  );
}

function DeliveryDatePicker({ 
  date, 
  onDateChange, 
  disabled 
}: Readonly<{
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  disabled?: boolean;
}>) {
  return (
    <div className="flex flex-col space-y-2">
      <Label>Estimated Delivery Date</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <FiCalendar className="mr-2 size-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            initialFocus
            disabled={(date) => date < new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function PaymentPreferenceSelector({
  value,
  onChange,
  disabled
}: Readonly<{
  value: 'FULL' | 'DOWNPAYMENT';
  onChange: (value: 'FULL' | 'DOWNPAYMENT') => void;
  disabled?: boolean;
}>) {
  return (
    <div className="space-y-2">
      <Label>Payment Preference</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange as (value: string) => void}
        disabled={disabled}
        className="flex flex-col space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="FULL" id="full" />
          <Label htmlFor="full" className="cursor-pointer">
            Full Payment
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="DOWNPAYMENT" id="downpayment" />
          <Label htmlFor="downpayment" className="cursor-pointer">
            Downpayment (50% of total amount)
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}

function ConfirmOrderDialog({ 
  onConfirm, 
  finalAmount, 
  disabled, 
  isPending 
}: Readonly<{
  onConfirm: () => void;
  finalAmount: number;
  disabled: boolean;
  isPending: boolean;
}>) {
  const showToast = useToast;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="w-full gap-2"
          variant={finalAmount === 0 ? "destructive" : "default"}
          disabled={disabled || isPending || finalAmount === 0}
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating Order...
            </>
          ) : (
            <>
              <FiShoppingBag className="size-4" />
              Create Order
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-neutral-2">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-primary">
            <FiAlertTriangle />
            Confirm Order Creation
          </AlertDialogTitle>
          <AlertDialogDescription>
            Please review the order details carefully. This action cannot be undone.
            
            {finalAmount === 0 && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>
                  Warning: The final amount is zero. The order cannot be created.
                </AlertDescription>
              </Alert>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="text-white" 
            onClick={() => {
              if (finalAmount === 0) {
                showToast({
                  type: "error",
                  title: "Invalid Order",
                  message: "The order amount cannot be zero."
                });
                return;
              }
              onConfirm();
            }}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type OrderSummaryProps = {
  orderItems: OrderItem[];
  form: UseFormReturn<CreateOrderType>;
  onSubmit: (data: CreateOrderType) => void;
  isPending?: boolean;
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
};

export function OrderSummary({ 
  orderItems, 
  form, 
  onSubmit,
  isPending = false,
  date,
  onDateChange
}: Readonly<OrderSummaryProps>) {
  const totalAmount = orderItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  const discountAmount = form.watch('discountAmount') || 0;
  const finalAmount = Math.max(0, totalAmount - discountAmount);
  const discountPercentage = ((discountAmount / totalAmount) * 100).toFixed(1);
  const { errors } = form.formState;

  const handleDiscountChange = (value: string) => {
    const amount = Number(value) || 0;
    form.setValue('discountAmount', amount, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handlePaymentPreferenceChange = (value: 'FULL' | 'DOWNPAYMENT') => {
    form.setValue('paymentPreference', value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <FormSection
      title="Order Summary"
    >
      <div className="grid gap-6">
        <PricingSummary
          totalAmount={totalAmount}
          discountAmount={discountAmount}
          finalAmount={finalAmount}
          discountPercentage={discountPercentage}
          onDiscountChange={handleDiscountChange}
          disabled={isPending}
        />

        <DeliveryDatePicker
          date={date}
          onDateChange={onDateChange}
          disabled={isPending}
        />

        <PaymentPreferenceSelector
          value={form.watch('paymentPreference') || 'FULL'}
          onChange={handlePaymentPreferenceChange}
          disabled={isPending}
        />

        <div className="space-y-2">
          <Label>Order Notes (Optional)</Label>
          <Textarea
            placeholder="Add any special instructions or notes for this order..."
            {...form.register('customerNotes')}
            className="min-h-[100px] resize-y"
            disabled={isPending}
          />
        </div>

        <ConfirmOrderDialog
          onConfirm={form.handleSubmit(onSubmit)}
          finalAmount={finalAmount}
          disabled={!date || orderItems.length === 0}
          isPending={isPending}
        />

        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive">
            <FiAlertTriangle className="size-4" />
            <AlertDescription>
              <ul className="list-disc pl-4">
                {Object.entries(errors).map(([key, error]) => (
                  error?.message ? <li key={key}>{error.message}</li> : null
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </FormSection>
  );
}