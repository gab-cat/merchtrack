import { Log } from "@prisma/client";

export type ExtendedLogs = Log & {
  user?: Partial<BasicUserInfo>
  createdBy: Partial<BasicUserInfo>;
  category?: string;
}

type BasicUserInfo = {
  firstName: string
  lastName: string
  email: string
  clerkId: string
}

export enum LogType {
  USER_UPDATED = 'USER_UPDATED',
  USER_CREATED = 'USER_CREATED',
  USER_DELETED = 'USER_DELETED',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_PASSWORD_RESET = 'USER_PASSWORD_RESET',
  USER_EMAIL_VERIFIED = 'USER_EMAIL_VERIFIED',
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_UPDATED = 'ORDER_UPDATED',
  ORDER_DELETED = 'ORDER_DELETED',
  PAYMENT_CREATED = 'PAYMENT_CREATED',
  PAYMENT_UPDATED = 'PAYMENT_UPDATED',
  PAYMENT_DELETED = 'PAYMENT_DELETED',
  PRODUCT_CREATED = 'PRODUCT_CREATED',
  PRODUCT_UPDATED = 'PRODUCT_UPDATED',
  PRODUCT_DELETED = 'PRODUCT_DELETED',
  CATEGORY_CREATED = 'CATEGORY_CREATED',
  CATEGORY_UPDATED = 'CATEGORY_UPDATED',
  CATEGORY_DELETED = 'CATEGORY_DELETED',
}

export interface CreateLogParams {
  type: LogType;
  userId: string;
  description: string;
  metadata?: Record<string, unknown>;
}