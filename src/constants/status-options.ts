import { OrderPaymentStatus, OrderStatus, PaymentSite, Role } from "@prisma/client";
import { StatusOption } from "@/types/Misc";


export const paymentStatusOptions: StatusOption<OrderPaymentStatus>[] = [
  { label: "Paid", value: OrderPaymentStatus.PAID, variant: "outline", className: "border-green-500 text-green-500 bg-green-50" },
  { label: "Partially Paid", value: OrderPaymentStatus.DOWNPAYMENT, variant: "outline", className: "border-yellow-500 text-yellow-500 bg-yellow-50" },
  { label: "Pending", value: OrderPaymentStatus.PENDING, variant: "outline", className: "border-red-500 text-red-500 bg-red-50" },
  { label: "Refunded", value: OrderPaymentStatus.REFUNDED, variant: "outline", className: "border-blue-500 text-blue-500 bg-blue-50" },
];

export const orderStatusOptions: StatusOption<OrderStatus>[] = [
  { label: "Pending", value: OrderStatus.PENDING, variant: "outline", className: "border-purple-500 text-purple-500 bg-purple-50" },
  { label: "Processing", value: OrderStatus.PROCESSING, variant: "outline", className: "border-blue-500 text-blue-500 bg-blue-50" },
  { label: "Ready", value: OrderStatus.READY, variant: "outline", className: "border-yellow-500 text-yellow-500 bg-yellow-50" },
  { label: "Completed", value: OrderStatus.DELIVERED, variant: "outline", className: "border-green-500 text-green-500 bg-green-50" },
  { label: "Canceled", value: OrderStatus.CANCELLED, variant: "outline", className: "border-red-500 text-red-500 bg-red-50" },
];

export const paymentMethodOptions: StatusOption<PaymentSite>[] = [
  { label: "Onsite", value: "ONSITE", className: "bg-green-600 text-white" },
  { label: "Offsite", value: "OFFSITE", className: "bg-blue-600 text-white" },
];

export const customerTypeOptions: StatusOption<Role>[] = [
  { label: "Student (COCS)", value: Role.STUDENT, variant: "outline", className: "border-blue-500 text-blue-500 bg-blue-50" },
  { label: "Faculty/Staff", value: Role.STAFF_FACULTY, variant: "outline", className: "border-purple-500 text-purple-500 bg-purple-50" },
  { label: "Athlete (COCS)", value: Role.PLAYER, variant: "outline", className: "border-green-500 text-green-500 bg-green-50" },
  { label: "Alumni (COCS)", value: Role.ALUMNI, variant: "outline", className: "border-red-500 text-red-500 bg-red-50" },
  { label: "Others", value: Role.OTHERS, variant: "outline", className: "border-orange-500 text-orange-500 bg-orange-50" },
];

