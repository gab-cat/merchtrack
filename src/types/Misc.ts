// Types and Interfaces
export type OrderStatus = 'pending' | 'confirmed' | 'unfulfilled' | 'fulfilled' | 'canceled';
export type PaymentStatus = 'paid' | 'partially_paid' | 'unpaid' | 'refunded';
export type PaymentMethod = 'onsite' | 'offsite';
export type CustomerType = 
  | 'student_cocs' 
  | 'student_other' 
  | 'teacher' 
  | 'athlete_cocs' 
  | 'alumni_cocs' 
  | 'other';

export interface Order {
  id: string;
  orderNo: string;
  date: string;
  customerName: string;
  customerType: CustomerType;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  amount: number;
}

export interface StatusOption {
  label: string;
  value: OrderStatus | PaymentStatus | PaymentMethod | CustomerType;
  variant?: 'default' | 'outline';
  className?: string;
}

// Sample Data
export const orders: Order[] = [
  {
    id: '1',
    orderNo: '#122',
    date: '01/01/02',
    customerName: 'Kyla Ronquillo',
    customerType: 'student_cocs',
    paymentStatus: 'paid',
    paymentMethod: 'onsite',
    orderStatus: 'pending',
    amount: 120.0,
  },
  {
    id: '2',
    orderNo: '#123',
    date: '01/01/02',
    customerName: 'John Doe',
    customerType: 'teacher',
    paymentStatus: 'partially_paid',
    paymentMethod: 'offsite',
    orderStatus: 'confirmed',
    amount: 150.0,
  },
  {
    id: '3',
    orderNo: '#124',
    date: '01/01/02',
    customerName: 'John Doereta',
    customerType: 'teacher',
    paymentStatus: 'partially_paid',
    paymentMethod: 'offsite',
    orderStatus: 'confirmed',
    amount: 150.0,
  },
  {
    id: '4',
    orderNo: '#124',
    date: '01/01/02',
    customerName: 'John Doereta',
    customerType: 'teacher',
    paymentStatus: 'partially_paid',
    paymentMethod: 'offsite',
    orderStatus: 'confirmed',
    amount: 150.0,
  },
];
