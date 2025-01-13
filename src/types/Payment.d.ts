export enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  MOBILE_PAYMENT = "MOBILE_PAYMENT",
  ONLINE_PAYMENT = "ONLINE_PAYMENT"
}

export enum PaymentStatus {
  VERIFIED = "VERIFIED",
  PENDING = "PENDING",
  DECLINED = "DECLINED"
}

export enum PaymentType {
  PAYMENT = "PAYMENT",
  REFUND = "REFUND"
}

/** 
 * @warning This type may contain PCI-sensitive data.
 * Ensure compliance with security requirements.
 */
export type Payment = {
  id: string
  orderId: string
  userId: string
  processedById?: string | null
  paymentDate: Date
  amount: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  referenceNo: string
  createdAt: Date
  updatedAt: Date
}