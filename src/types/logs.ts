import { Log } from "@prisma/client";

export interface ExtendedLogs extends Log {
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  category?: string;
}