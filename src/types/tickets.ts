import { Ticket } from "@prisma/client";
import { BasicUser } from "@/types/users";

export type ExtendedTicket = Omit<Ticket, 'updates'> & {
  updates: TicketUpdate[];
  createdBy: BasicUser;
  assignedTo?: BasicUser;
};