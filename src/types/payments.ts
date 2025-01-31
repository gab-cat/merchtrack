export interface OffsitePaymentRequest {
    orderId: string
    orderNo: string
    customerName: string
    amount: number
    status: "pending" | "confirmed" | "rejected"
    date: string
  }
  
export interface Transaction {
    id: string
    orderId: string
    orderNo: string
    customerName: string
    amount: number
    paymentType: "onsite" | "offsite"
    date: string
  }
  
// Mock data for offsite payment requests
export const offsitePayments: OffsitePaymentRequest[] = [
  {
    orderId: "ORD001",
    orderNo: "#122",
    customerName: "Kyla S. Ronquillo",
    amount: 350.0,
    status: "pending",
    date: "2024-01-30",
  },
  {
    orderId: "ORD002",
    orderNo: "#123",
    customerName: "John Doe",
    amount: 250.0,
    status: "pending",
    date: "2024-01-30",
  },
  // Add more mock data as needed
];
  
// Mock data for transaction history
export const transactions: Transaction[] = [
  {
    id: "TRX001",
    orderId: "ORD003",
    orderNo: "#124",
    customerName: "Jane Smith",
    amount: 350.0,
    paymentType: "onsite",
    date: "2024-01-29",
  },
  {
    id: "TRX002",
    orderId: "ORD004",
    orderNo: "#125",
    customerName: "Alex Johnson",
    amount: 250.0,
    paymentType: "offsite",
    date: "2024-01-29",
  },
  // Add more mock data as needed
];
  
  