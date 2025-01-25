// Types and Interfaces
export type OrderStatus = "pending" | "confirmed" | "unfulfilled" | "fulfilled" | "canceled"
export type PaymentStatus = "paid" | "partially_paid" | "unpaid" | "refunded"
export type PaymentMethod = "onsite" | "offsite"
export type CustomerType = "student_cocs" | "student_other" | "teacher" | "athlete_cocs" | "alumni_cocs" | "other"

export interface OrderItem {
  id: string
  itemName: string
  quantity: number
  price: number
}

export enum Role {
    PLAYER = "PLAYER",
    STUDENT = "STUDENT",
    STAFF_FACULTY = "STAFF_FACULTY",
    ALUMNI = "ALUMNI",
    OTHERS = "OTHERS"
  }

export enum College {
    NOT_APPLICABLE = "NOT_APPLICABLE",
    COCS = "COCS",
    STEP = "STEP",
    ABBS = "ABBS",
    JPIA = "JPIA",
    ACHSS = "ACHSS",
    ANSA = "ANSA",
    COL = "COL",
    AXI = "AXI"
  }

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
  items: OrderItem[]
  otherFees: number
  total: number
  balance: number
}

export interface StatusOption {
  label: string
  value: OrderStatus | PaymentStatus | PaymentMethod | CustomerType
  variant?: "default" | "outline"
  className?: string
}

// Sample Data
export const orders: Order[] = [
  {
    id: "ORD001",
    orderNo: "#122",
    date: "2023-05-15",
    customerName: "Kyla Ronquillo",
    customerType: "student_cocs",
    paymentStatus: "paid",
    paymentMethod: "onsite",
    orderStatus: "fulfilled",
    amount: 360.0,
    items: [
      { id: "1", itemName: "COCS T-Shirt", quantity: 2, price: 150.0 },
      { id: "2", itemName: "COCS Lanyard", quantity: 1, price: 60.0 },
    ],
    otherFees: 0.0,
    total: 360.0,
    balance: 0.0,
  },
  {
    id: "ORD002",
    orderNo: "#123",
    date: "2023-05-16",
    customerName: "John Doe",
    customerType: "teacher",
    paymentStatus: "partially_paid",
    paymentMethod: "offsite",
    orderStatus: "confirmed",
    amount: 550.0,
    items: [
      { id: "3", itemName: "COCS Jacket", quantity: 1, price: 500.0 },
      { id: "4", itemName: "COCS Pen", quantity: 2, price: 25.0 },
    ],
    otherFees: 0.0,
    total: 550.0,
    balance: 275.0,
  },
  {
    id: "ORD003",
    orderNo: "#124",
    date: "2023-05-17",
    customerName: "Jane Smith",
    customerType: "student_other",
    paymentStatus: "unpaid",
    paymentMethod: "offsite",
    orderStatus: "pending",
    amount: 200.0,
    items: [
      { id: "5", itemName: "COCS Notebook", quantity: 2, price: 75.0 },
      { id: "6", itemName: "COCS Sticker Set", quantity: 1, price: 50.0 },
    ],
    otherFees: 0.0,
    total: 200.0,
    balance: 200.0,
  },
  {
    id: "ORD004",
    orderNo: "#125",
    date: "2023-05-18",
    customerName: "Alex Johnson",
    customerType: "alumni_cocs",
    paymentStatus: "unpaid",
    paymentMethod: "offsite",
    orderStatus: "unfulfilled",
    amount: 450.0,
    items: [
      { id: "7", itemName: "COCS Hoodie", quantity: 1, price: 400.0 },
      { id: "8", itemName: "COCS Cap", quantity: 1, price: 50.0 },
    ],
    otherFees: 0.0,
    total: 450.0,
    balance: 450.0,
  },
];

