"use server";

import prisma from "@/lib/db";
import { formContactSchema, FormContactType } from "@/schema/public-contact";

export async function submitMessage(prevState: FormContactType, formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());

  const result = formContactSchema.safeParse(rawFormData);

  if (!result.success) {
    const errors = result.error.errors.reduce((acc: Record<string, string>, error) => {
      acc[error.path[0]] = error.message;
      return acc;
    }, {});

    return {
      errors,
      prevData: rawFormData, 
    };
  }

  const { email, subject, message } = result.data;

  try {
    const contactSubmit = await prisma.message.create({
      data: {
        email,
        subject,
        message,
      },
    });

    return { message: "Your message has been sent successfully!", data: contactSubmit };
  } catch {
    
    return { errors: { general: "An error occurred while submitting the message." }, prevData: rawFormData };
  }
}