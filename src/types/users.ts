import { Role, College } from "@/types/Misc";

export interface UserData {
  id: string
  name: string
  email: string
  role: Role
  college: College
  type: "admin" | "member"
}

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

