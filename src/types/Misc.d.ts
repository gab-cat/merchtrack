export type OrderStatus = 'pending' | 'confirmed' | 'unfulfilled' | 'fulfilled' | 'canceled'
export type PaymentStatus = 'paid' | 'partially_paid' | 'unpaid' | 'refunded'
export type PaymentMethod = 'onsite' | 'offsite'
export type CustomerType = 'student_cocs' | 'student_other' | 'teacher' | 'athlete_cocs' | 'alumni_cocs' | 'other'

export interface Order {
  id: string
  orderNo: string
  date: string
  customerName: string
  customerType: CustomerType
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  orderStatus: OrderStatus
  amount: number
}

export interface StatusOption {
  label: string
  value: OrderStatus | PaymentStatus | PaymentMethod | CustomerType
  variant?: "default" | "outline"
  className?: string
}

