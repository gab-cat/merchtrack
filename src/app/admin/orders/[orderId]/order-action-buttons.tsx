import { BiPackage, BiCheckCircle, BiMoney, BiTrash } from "react-icons/bi";
import { FC, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { OrderStatus, OrderPaymentStatus } from "@/types/orders";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

interface OrderActionButtonsProps {
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  isUpdatingStatus: boolean;
  onUpdateStatus: (status: OrderStatus, reason?: string) => void;
  orderId: string;
}

export const OrderActionButtons: FC<OrderActionButtonsProps> = ({
  status,
  paymentStatus,
  isUpdatingStatus,
  onUpdateStatus,
  orderId
}) => {
  const [cancelReason, setCancelReason] = useState("");
  const [readyReason, setReadyReason] = useState("");

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
          <span>
            <AlertDialogDescription>
              This action will mark the order as ready for pickup. Make sure all items are prepared and packaged.
            </AlertDialogDescription>
            <Textarea
              value={readyReason}
              onChange={(e) => setReadyReason(e.target.value)}
              placeholder="Enter notes for the customer..."
              className="mt-2"
              required
            />
          </span>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (readyReason.trim()) {
                onUpdateStatus(OrderStatus.READY, readyReason);
                setReadyReason("");
              } else {
                toast.error("Please provide notes for the customer");
              }
            }}
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
    <Link href={`/admin/payments?orderId=${orderId}`} passHref>
      <Button variant='outline'>
        <BiMoney className="mr-2 size-4" />
        Make Payment for Order
      </Button>
    </Link>
  );

  const renderCancelButton = () => {
    if (status === OrderStatus.CANCELLED || status === OrderStatus.DELIVERED) return null;

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="destructive"
            disabled={isUpdatingStatus}
            className="bg-red-600 hover:bg-red-700"
          >
            <BiTrash className="mr-2 size-4" />
            {isUpdatingStatus ? "Cancelling..." : "Cancel Order"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will cancel the entire order and cannot be undone. Please provide a reason for cancellation:
            </AlertDialogDescription>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              className="mt-2"
              required
            />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancelReason("")}>No, go back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (cancelReason.trim()) {
                  onUpdateStatus(OrderStatus.CANCELLED, cancelReason);
                  setCancelReason("");
                } else {
                  toast.error("Please provide a reason for cancellation");
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={!cancelReason.trim() || isUpdatingStatus}
            >
              Yes, cancel order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return (
    <div className="flex items-center gap-4">
      {status === OrderStatus.PROCESSING && renderProcessingButton()}
      {status === OrderStatus.READY && renderReadyButton()}
      {(paymentStatus === OrderPaymentStatus.PENDING || paymentStatus === OrderPaymentStatus.DOWNPAYMENT) && renderPendingPaymentButton()}
      {renderCancelButton()}
    </div>
  );
};