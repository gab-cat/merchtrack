import { StatusOption } from "@/types/Misc";

export const paymentStatusOptions: StatusOption[] = [
  { label: "Paid", value: "paid", variant: "outline", className: "border-green-500 text-green-500 bg-green-50" },
  { label: "Partially Paid", value: "partially_paid", variant: "outline", className: "border-yellow-500 text-yellow-500 bg-yellow-50" },
  { label: "Unpaid", value: "unpaid", variant: "outline", className: "border-red-500 text-red-500 bg-red-50" },
  { label: "Refunded", value: "refunded", variant: "outline", className: "border-blue-500 text-blue-500 bg-blue-50" },
];

export const orderStatusOptions: StatusOption[] = [
  { label: "Pending", value: "pending", variant: "outline", className: "border-purple-500 text-purple-500 bg-purple-50" },
  { label: "Confirmed", value: "confirmed", variant: "outline", className: "border-blue-500 text-blue-500 bg-blue-50" },
  { label: "Unfulfilled", value: "unfulfilled", variant: "outline", className: "border-yellow-500 text-yellow-500 bg-yellow-50" },
  { label: "Fulfilled", value: "fulfilled", variant: "outline", className: "border-green-500 text-green-500 bg-green-50" },
  { label: "Canceled", value: "canceled", variant: "outline", className: "border-red-500 text-red-500 bg-red-50" },
];

export const paymentMethodOptions: StatusOption[] = [
  { label: "Onsite", value: "onsite", className: "bg-green-600" },
  { label: "Offsite", value: "offsite", className: "bg-blue-600" },
];

export const customerTypeOptions: StatusOption[] = [
  { label: "Student (COCS)", value: "student_cocs", variant: "outline", className: "border-blue-500 text-blue-500 bg-blue-50" },
  { label: "Student (Other)", value: "student_other", variant: "outline", className: "border-blue-500 text-blue-500 bg-blue-50" },
  { label: "Teacher", value: "teacher", variant: "outline", className: "border-purple-500 text-purple-500 bg-purple-50" },
  { label: "Athlete (COCS)", value: "athlete_cocs", variant: "outline", className: "border-green-500 text-green-500 bg-green-50" },
  { label: "Alumni (COCS)", value: "alumni_cocs", variant: "outline", className: "border-red-500 text-red-500 bg-red-50" },
  { label: "Other", value: "other", variant: "outline", className: "border-orange-500 text-orange-500 bg-orange-50" },
];

