import { Message, User } from "@prisma/client";

export type ExtendedMessage = Message & {
  user: User | null;
};