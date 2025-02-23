import { render } from "@react-email/components";
import { OrderStatus } from "@prisma/client";
import { sendEmail } from "./mailgun";
import { OrderConfirmationEmail } from "@/templates/OrderConfirmationEmail";
import { OrderStatusEmail } from "@/templates/OrderStatusEmail";
import { PaymentStatusEmail } from "@/templates/PaymentStatusEmail";
import { ExtendedOrder } from "@/types/orders";

interface OrderConfirmationEmailParams {
  order: ExtendedOrder;
  customerName: string;
  customerEmail: string;
}

interface OrderStatusEmailParams {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  newStatus: OrderStatus;
  surveyLink?: string;
  order: ExtendedOrder;
}

interface PaymentStatusEmailParams {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: 'verified' | 'refunded';
  refundReason?: string;
}

export const sendOrderConfirmationEmail = async (params: OrderConfirmationEmailParams) => {
  await sendEmail({
    to: params.customerEmail,
    subject: `Order Confirmation - #${params.order.id}`,
    html: await render(OrderConfirmationEmail({ 
      order: params.order,
      customerName: params.customerName
    })),
    from: 'MerchTrack Orders'
  });
};
export const sendOrderStatusEmail = async (params: OrderStatusEmailParams) => {
  await sendEmail({
    to: params.customerEmail,
    subject: `Order Update - ${params.newStatus} #${params.orderNumber}`,
    html: await render(OrderStatusEmail({ 
      orderNumber: params.orderNumber,
      customerName: params.customerName,
      newStatus: params.newStatus,
      surveyLink: params.surveyLink ?? '',
      order: params.order
    })),
    from: 'MerchTrack Orders'
  });
};

export const sendPaymentStatusEmail = async (params: PaymentStatusEmailParams) => {
  await sendEmail({
    to: params.customerEmail,
    subject: `Payment ${params.status === 'verified' ? 'Verification' : 'Refund'} - #${params.orderNumber}`,
    html: await render(PaymentStatusEmail({ 
      orderNumber: params.orderNumber,
      customerName: params.customerName,
      amount: params.amount,
      status: params.status,
      refundReason: params.refundReason
    })),
    from: 'MerchTrack Payments'
  });
};