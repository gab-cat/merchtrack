import { CalendarIcon, Loader2 } from "lucide-react";
import { FiDollarSign, FiPercent, FiShoppingBag, FiCalendar, FiAlertTriangle } from "react-icons/fi";
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
    <div className="border-border bg-card relative rounded-lg border p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <FiShoppingBag className="text-primary" />
            Total Amount
          </Label>
          <div className="flex items-baseline gap-2">
            <FiDollarSign className="text-muted-foreground size-4 text-xl" />
            <p className="text-2xl font-bold">{totalAmount.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountAmount" className="flex items-center gap-2">
            <FiPercent className="text-primary" />
            Discount Amount
          </Label>
          <div className="relative">
            <FiDollarSign className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              type="number"
              step="0.01"
              min="0"
              max={totalAmount}
              value={discountAmount}
              onChange={(e) => onDiscountChange(e.target.value)}
              disabled={disabled}
              className="pl-8"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Badge className="text-xs text-white">
                {discountPercentage}%
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex items-baseline justify-between">
        <Label>Final Amount</Label>
        <div className="flex items-baseline gap-2">
          <FiDollarSign className={cn(
            "h-4 w-4 text-xl",
            finalAmount === 0 ? "text-destructive" : "text-primary"
          )} />
          <p className={cn(
            "text-3xl font-bold",
            finalAmount === 0 ? "text-destructive" : "text-primary"
          )}>
            {finalAmount.toFixed(2)}
          </p>
        </div>
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
    <div className="grid w-full gap-2">
      <Label className="flex items-center gap-2">
        <FiCalendar className="text-primary" />
        Estimated Delivery Date
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 size-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            className="bg-neutral-2"
            mode="single"
            selected={date}
            onSelect={onDateChange}
            initialFocus
            disabled={(date) => 
              date < new Date() || 
              date > new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            }
          />
        </PopoverContent>
      </Popover>
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
          className="w-full text-white"
          variant={finalAmount === 0 ? "destructive" : "default"}
          disabled={disabled || isPending || finalAmount === 0}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Creating Order...
            </>
          ) : (
            <>
              <FiShoppingBag className="mr-2" />
              Create Order
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-neutral-2">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-primary">
            <FiAlertTriangle className="text-warning" />
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
                  message: "Final amount cannot be zero"
                });
                return;
              }
              onConfirm();
            }}
          >
            Confirm Order
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
  const { watch, setValue, formState: { errors } } = form;
  const showToast = useToast;

  const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = watch('discountAmount') || 0;
  const finalAmount = Math.max(0, totalAmount - discountAmount);
  const discountPercentage = totalAmount > 0 ? ((discountAmount / totalAmount) * 100).toFixed(1) : '0';

  const validateDiscountAmount = (value: string) => {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || numValue < 0) {
      setValue('discountAmount', 0);
      showToast({
        type: "error",
        title: "Invalid Discount",
        message: "Discount amount cannot be negative"
      });
      return;
    }
    
    if (numValue > totalAmount) {
      setValue('discountAmount', totalAmount);
      showToast({
        type: "warning",
        title: "Discount Adjusted",
        message: "Discount amount cannot exceed total amount"
      });
      return;
    }
    
    setValue('discountAmount', numValue);
  };

  return (
    <FormSection title="Order Summary">
      <div className="space-y-6">
        <PricingSummary
          totalAmount={totalAmount}
          discountAmount={discountAmount}
          finalAmount={finalAmount}
          discountPercentage={discountPercentage}
          onDiscountChange={validateDiscountAmount}
          disabled={isPending}
        />

        <DeliveryDatePicker
          date={date}
          onDateChange={onDateChange}
          disabled={isPending}
        />
      </div>

      <Separator className="my-6" />

      <ConfirmOrderDialog
        onConfirm={form.handleSubmit(onSubmit)}
        finalAmount={finalAmount}
        disabled={!date || orderItems.length === 0}
        isPending={isPending}
      />

      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive" className="mt-4">
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
    </FormSection>
  );
}