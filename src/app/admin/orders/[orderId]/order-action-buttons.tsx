import { BiPackage, BiCheckCircle, BiMoney } from "react-icons/bi";
import { FC } from "react";
import { OrderStatus, OrderPaymentStatus } from "@/types/orders";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface OrderActionButtonsProps {
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  isUpdatingStatus: boolean;
  isUpdatingPayment: boolean;
  onUpdateStatus: (status: OrderStatus) => void;
  onUpdatePayment: (status: OrderPaymentStatus) => void;
}

export const OrderActionButtons: FC<OrderActionButtonsProps> = ({
  status,
  paymentStatus,
  isUpdatingStatus,
  isUpdatingPayment,
  onUpdateStatus,
  onUpdatePayment
}) => {
  const renderProcessingButton = () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isUpdatingStatus}
        >
          <BiPackage className="mr-2 size-4" />
          {isUpdatingStatus ? "Updating..." : "Mark as Ready"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-neutral-2">
        <AlertDialogHeader>
          <AlertDialogTitle>Mark Order as Ready?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will mark the order as ready for pickup. Make sure all items are prepared and packaged.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onUpdateStatus(OrderStatus.READY)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const renderReadyButton = () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          disabled={isUpdatingStatus}
        >
          <BiCheckCircle className="mr-2 size-4" />
          {isUpdatingStatus ? "Updating..." : "Mark as Completed"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark Order as Completed?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will mark the order as delivered. This should only be done after confirming the customer has received their order.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onUpdateStatus(OrderStatus.DELIVERED)}
            className="bg-green-600 hover:bg-green-700"
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const renderPendingPaymentButton = () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline"
          disabled={isUpdatingPayment}
        >
          <BiMoney className="mr-2 size-4" />
          {isUpdatingPayment ? "Updating..." : "Mark as Paid"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark Payment as Paid?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will mark the payment as completed. Please ensure you have received and verified the payment.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onUpdatePayment(OrderPaymentStatus.PAID)}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="flex items-center gap-4">
      {status === OrderStatus.PROCESSING && renderProcessingButton()}
      {status === OrderStatus.READY && renderReadyButton()}
      {paymentStatus === OrderPaymentStatus.PENDING && renderPendingPaymentButton()}
    </div>
  );
};