import { z } from "zod";
import { UserPermission } from "@prisma/client";
import { Role, College } from "@/types/Misc";

export const resetUserPasswordSchema = z.object({
  clerkId: z.string().min(1, { message: "User ID is required" }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters long" }),
  skipLegalChecks: z.boolean().optional(),
  signOutOfOtherSessions: z.boolean().optional(),
});

export type ResetUserPasswordType = z.infer<typeof resetUserPasswordSchema>;

export const updateUserSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters long" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters long" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters long" }),
  role: z.nativeEnum(Role, { message: "Invalid role" }),
  college: z.nativeEnum(College, { message: "Invalid college" }),
  courses: z.string().min(2, { message: "Courses must be at least 2 characters long" }),
  imageUrl: z.string().optional(),
  isStaff: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
});

export type UpdateUserType = z.infer<typeof updateUserSchema>;

export type UpdateUserPermissionsParams = {
  userId: string;
  currentUserId: string;
  permissions: Record<string, Partial<UserPermission>>;
};

export type AssignManagerParams = {
  userId: string;
  managerId: string;
};

export type UpdateUserParams = {
  userId: string;
  targetUserId: string;
  data: UpdateUserType;
}

export type ResetPasswordForUserParams = {
  userId: string;
  params: ResetUserPasswordType;
} 