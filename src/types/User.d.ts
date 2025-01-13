export enum Role {
  STUDENT = "STUDENT",
  STUDENT_NON_COCS = "STUDENT_NON_COCS",
  STAFF_FACULTY = "STAFF_FACULTY",
  ALUMNI = "ALUMNI",
  OTHERS = "OTHERS"
}

export enum College {
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

export type User = {
  id: string
  clerkId: string
  firstName?: string | null
  lastName?: string | null
  managerId?: string | null
  email: string
  phone: string
  courses: string
  isStaff: boolean
  isAdmin: boolean
  isSetupDone: boolean
  createdAt: Date
  updatedAt: Date
  role: Role
  college: College
}