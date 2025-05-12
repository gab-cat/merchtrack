import { FC } from "react";
import { BiBox } from "react-icons/bi";
import { OrderStatusTimeline } from "@/features/admin/orders/components";
import { OrderStatus, OrderPaymentStatus } from "@/types/orders";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OrderStatusCardProps {
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
}

const getOrderStatusColor = (status: OrderStatus) => {
  switch (status) {
  case OrderStatus.PENDING:
    return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80";
  case OrderStatus.PROCESSING:
    return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
  case OrderStatus.READY:
    return "bg-purple-100 text-purple-800 hover:bg-purple-100/80";
  case OrderStatus.DELIVERED:
    return "bg-green-100 text-green-800 hover:bg-green-100/80";
  default:
    return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
  }
};

const getPaymentStatusColor = (status: OrderPaymentStatus) => {
  switch (status) {
  case OrderPaymentStatus.PENDING:
    return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80";
  case OrderPaymentStatus.PAID:
    return "bg-green-100 text-green-800 hover:bg-green-100/80";
  case OrderPaymentStatus.REFUNDED:
    return "bg-red-100 text-red-800 hover:bg-red-100/80";
  default:
    return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
  }
};

export const OrderStatusCard: FC<OrderStatusCardProps> = ({ status, paymentStatus }) => {
  return (
    <Card className="shadow-sm md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <BiBox className="size-5" />
          Order Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge 
              className={cn(
                "px-4 py-1 text-sm",
                getOrderStatusColor(status)
              )}
            >
              {status}
            </Badge>
            <Badge 
              className={cn(
                "px-4 py-1 text-sm",
                getPaymentStatusColor(paymentStatus)
              )}
            >
              {paymentStatus}
            </Badge>
          </div>
          <OrderStatusTimeline currentStatus={status} />
        </div>
      </CardContent>
    </Card>
  );
};