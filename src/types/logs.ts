import { Log } from "@prisma/client";

export interface ExtendedLogs extends Log {
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