import { z } from "zod";
import { College, Role } from '@/types/Misc';

export const OnboardingFormSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(10),
  role: z.nativeEnum(Role),
  college: z.nativeEnum(College),
  courses: z.string().min(2),
});

export type OnboardingForm = z.infer<typeof OnboardingFormSchema>;