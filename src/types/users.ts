import { Cart, Log, Payment, Ticket, User, UserPermission } from "@prisma/client";
import { Role, College } from "@/types/Misc";
import { ExtendedOrder } from "@/types/orders";

export type ExtendedUser = User & Partial<{
  logs: Log[]
  createdLogs: Log[]
  orders: ExtendedOrder[]
  payments: Payment[]
  User: User[]
  manager: User
  userPermissions: UserPermission[]
  createdTickets: Ticket[]
  Cart: Cart[]
}>;

export type BasicUser = Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'role' | 'college'>;

export interface UserData {
  id: string
  name: string
  email: string
  role: Role
  college: College
  type: "admin" | "member"
};

export const users: UserData[] = [
  {
    id: "1",
    name: "Kyla S. Ronquillo",
    email: "kyronquillo@gbox.adnu.edu.ph",
    role: Role.STAFF_FACULTY,
    college: College.COCS,
    type: "admin",
  },
  {
    id: "2",
    name: "Kyla S. Ronquillo",
    email: "kyronquillo@gbox.adnu.edu.ph",
    role: Role.STUDENT,
    college: College.COCS,
    type: "member",
  },
  {
    id: "3",
    name: "Kyla S. Ronquillo",
    email: "kyronquillo@gbox.adnu.edu.ph",
    role: Role.STUDENT,
    college: College.COCS,
    type: "member",
  },
];

