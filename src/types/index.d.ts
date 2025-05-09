/**
 * Represents a link with a URL and display name.
 */
declare type LinkType = {
  href: string;
  displayName: string;
};

/**
 * Represents a rating value from 1 to 5.
 */
declare type Rating = 1 | 2 | 3 | 4 | 5;

/**
 * Represents the possible statuses of fulfillment.
 */
declare enum FulfillmentStatus {
  PENDING = "PENDING",
  PRODUCTION = "PRODUCTION",
  READY = "READY",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

/**
 * Represents the allowed transitions between fulfillment statuses.
 */
declare type StatusTransition = {
  [FulfillmentStatus.PENDING]: FulfillmentStatus.PRODUCTION | FulfillmentStatus.CANCELLED;
  [FulfillmentStatus.PRODUCTION]: FulfillmentStatus.READY | FulfillmentStatus.CANCELLED;
  [FulfillmentStatus.READY]: FulfillmentStatus.COMPLETED | FulfillmentStatus.CANCELLED;
  [FulfillmentStatus.COMPLETED]: never;
  [FulfillmentStatus.CANCELLED]: never;
};

/**
 * Represents the possible statuses of an order.
 */
declare enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED"
}

/**
 * Represents the reasons for order cancellation.
 */
declare enum CancellationReason {
  OUT_OF_STOCK = "OUT_OF_STOCK",
  CUSTOMER_REQUEST = "CUSTOMER_REQUEST",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  OTHER = "OTHER"
}

/**
 * Represents the available product sizes.
 */
declare enum ProductSize {
  XS = "XS",
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  XXL = "XXL"
}

/**
 * Represents the possible statuses of a payment.
 */
declare enum PaymentStatus {
  VERIFIED = "VERIFIED",
  PENDING = "PENDING",
  DECLINED = "DECLINED"
}

/**
 * Represents the types of payment transactions.
 */
declare enum PaymentType {
  PAYMENT = "PAYMENT",
  REFUND = "REFUND"
}

/**
 * Represents the methods of payment.
 */
declare enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  GCASH = "GCASH",
  MAYA = "MAYA",
  OTHERS = "OTHERS"
}

/**
 * Represents the price mapping for different roles.
 */
declare type PriceMap = {
  [Role.PLAYER]: number;
  [Role.STUDENT]: number;
  [Role.STUDENT_NON_COLLEGE]: number;
  [Role.STAFF_FACULTY]: number;
  [Role.ALUMNI]: number;
  [Role.OTHERS]: number;
};

/**
 * Represents the different roles of users.
 */
declare enum Role {
  PLAYER = "PLAYER",
  STUDENT = "STUDENT",
  STUDENT_NON_COLLEGE = "STUDENT_NON_COLLEGE",
  STAFF_FACULTY = "STAFF_FACULTY",
  ALUMNI = "ALUMNI",
  OTHERS = "OTHERS"
}

declare type RoleType = "PLAYER" | "STUDENT" | "STAFF_FACULTY" | "ALUMNI" | "OTHERS";

/**
 * Represents the different colleges.
 */
declare enum College {
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

declare type ActionsReturnType<T> = Promise<{
  success: boolean
  message?: string
  data?: T
  errors?: Record<string, unknown>
}>

declare type TicketUpdate = {
  status: "OPEN" | "CLOSED" | "IN_PROGRESS" | "RESOLVED" 
  message: string
  createdBy?: string
  createdAt?: string
}