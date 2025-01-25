import { z } from "zod";
import { College, Role } from '@/types/Misc';

export const OnboardingFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  firstName: z.string().min(2, { message: "First name must be at least 2 characters long" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters long" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters long" }),
  role: z.nativeEnum(Role, { message: "Invalid role" }),
  college: z.nativeEnum(College, { message: "Invalid college" }),
  courses: z.string().min(2, { message: "Courses must be at least 2 characters long" }),
});

export type OnboardingForm = z.infer<typeof OnboardingFormSchema>;