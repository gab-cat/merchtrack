import { render } from "@react-email/components";
import { OrderStatus } from "@prisma/client";
import { sendEmail } from "./mailgun";
import { OrderConfirmationEmail } from "@/templates/OrderConfirmationEmail";
import { OrderStatusEmail } from "@/templates/OrderStatusEmail";
import { PaymentStatusEmail } from "@/templates/PaymentStatusEmail";
import { ExtendedOrder } from "@/types/orders";

export const sendOrderConfirmationEmail = async (
  order: ExtendedOrder,
  customerName: string,
  customerEmail: string
) => {
  await sendEmail({
    to: customerEmail,
    subject: `Order Confirmation - #${order.id}`,
    html: await render(OrderConfirmationEmail({ 
      order,
      customerName
    })),
    from: 'MerchTrack Orders'
  });
};

export const sendOrderStatusEmail = async (
  orderNumber: string,
  customerName: string,
  customerEmail: string,
  newStatus: OrderStatus,
  surveyLink?: string
) => {
  await sendEmail({
    to: customerEmail,
    subject: `Order Status Update - #${orderNumber}`,
    html: await render(OrderStatusEmail({ 
      orderNumber,
      customerName,
      newStatus,
      surveyLink
    })),
    from: 'MerchTrack Orders'
  });
};

export const sendPaymentStatusEmail = async (
  orderNumber: string,
  customerName: string,
  customerEmail: string,
  amount: number,
  status: 'verified' | 'refunded',
  refundReason?: string
) => {
  await sendEmail({
    to: customerEmail,
    subject: `Payment ${status === 'verified' ? 'Verification' : 'Refund'} - #${orderNumber}`,
    html: await render(PaymentStatusEmail({ 
      orderNumber,
      customerName,
      amount,
      status,
      refundReason
    })),
    from: 'MerchTrack Payments'
  });
};