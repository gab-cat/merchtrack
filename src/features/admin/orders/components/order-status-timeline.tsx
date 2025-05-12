import { FC } from "react";
import { CheckCircle2, Clock, Package2, Truck, XCircle, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types/orders";

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  loading?: boolean;
}

const timelineSteps = [
  { 
    status: OrderStatus.PENDING, 
    icon: Clock, 
    label: "Order Placed",
    description: "Order has been received and is awaiting processing",
    color: "text-yellow-800 bg-yellow-100" 
  },
  { 
    status: OrderStatus.PROCESSING, 
    icon: Package2, 
    label: "Processing",
    description: "Order is being prepared and packaged",
    color: "text-blue-800 bg-blue-100"
  },
  { 
    status: OrderStatus.READY, 
    icon: Truck, 
    label: "Ready for Pickup",
    description: "Order is ready and waiting for pickup",
    color: "text-purple-800 bg-purple-100"
  },
  { 
    status: OrderStatus.DELIVERED, 
    icon: CheckCircle2, 
    label: "Completed",
    description: "Order has been successfully delivered",
    color: "text-green-800 bg-green-100"
  },
];

export const OrderStatusTimeline: FC<OrderStatusTimelineProps> = ({ currentStatus, loading = false }) => {
  const currentStepIndex = timelineSteps.findIndex(step => step.status === currentStatus);

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  // If order is cancelled, show a different timeline view
  if (currentStatus === OrderStatus.CANCELLED) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="relative z-10 flex size-10 items-center justify-center rounded-full border-2 bg-red-100 text-red-800">
            <XCircle className="size-5" />
          </div>
          <div className="flex-1 pt-1">
            <p className="font-medium text-red-800">Order Cancelled</p>
            <p className="text-muted-foreground text-sm">This order has been cancelled</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 h-full w-0.5 bg-gray-200" />
      <div className="space-y-8">
        {timelineSteps.map((step, index) => {
          const isPassed = index <= currentStepIndex;
          const Icon = step.icon;

          return (
            <div key={step.status} className="flex items-start gap-4">
              <div className={cn(
                "relative z-10 flex size-10 items-center justify-center rounded-full border-2 transition-all duration-200",
                isPassed ? step.color : "border-gray-300 bg-white"
              )}>
                <Icon className="size-5" />
              </div>
              <div className="flex-1 pt-1">
                <p className={cn(
                  "font-medium transition-colors",
                  isPassed && step.color.split(' ')[0]
                )}>
                  {step.label}
                </p>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};