import { formatCurrency } from '@/utils/format';
import { useOrderQuery } from '@/hooks/orders.hooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface OrderDetailsDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly orderId: string | null;
}

export function OrderDetailsDialog({ open, onOpenChange, orderId }: Readonly<OrderDetailsDialogProps>) {
  const { data: order, isLoading } = useOrderQuery(orderId ?? '');

  const getOrderStatusStyle = (status: string) => {
    switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'PROCESSING': return 'bg-blue-100 text-blue-800';
    case 'READY': return 'bg-purple-100 text-purple-800';
    case 'DELIVERED': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusStyle = (status: string) => {
    switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'VERIFIED': return 'bg-green-100 text-green-800';
    case 'REJECTED': return 'bg-red-100 text-red-800';
    case 'DOWNPAYMENT': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-neutral-2 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className='text-primary'>Order Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner size="lg" />
            <span className="ml-2">Loading order details...</span>
          </div>
        ) : !order ? (
          <div className="py-4 text-center text-red-600">
            Order not found
          </div>
        ) : (
          <div className="space-y-4">
            {/* Order Summary */}
            <Card className="bg-neutral-2 p-4">
              <div className="mb-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Order ID:</span>
                  <span>{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge variant="secondary" className={cn("font-medium", getOrderStatusStyle(order.status))}>
                    {order.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Payment Status:</span>
                  <Badge variant="secondary" className={cn("font-medium", getPaymentStatusStyle(order.paymentStatus))}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Order Items */}
            <Card className="p-4">
              <h3 className="mb-3 font-semibold">Order Items</h3>
              <div className="space-y-3">
                {order.orderItems?.map((item) => (
                  <div key={item.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{item.variant?.product?.title}</p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × {formatCurrency(Number(item.price))}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(Number(item.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 border-t pt-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(Number(order.totalAmount))}</span>
                </div>
                {Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(Number(order.discountAmount))}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(Number(order.totalAmount))}</span>
                </div>
              </div>
            </Card>

            {/* Payment History */}
            {order.payments && order.payments.length > 0 && (
              <Card className="p-4">
                <h3 className="mb-3 font-semibold">Payment History</h3>
                <div className="space-y-3">
                  {order.payments.map((payment) => (
                    <div key={payment.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{payment.paymentMethod}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                        {payment.referenceNo && (
                          <p className="text-sm text-gray-600">Ref: {payment.referenceNo}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(Number(payment.amount))}</p>
                        <Badge variant="secondary" className={cn("text-xs", getPaymentStatusStyle(payment.paymentStatus))}>
                          {payment.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}