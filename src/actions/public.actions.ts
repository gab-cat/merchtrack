"use server";

import prisma from "@/lib/db";
import { formContactSchema, FormContactType } from "@/schema/public-contact";

export async function submitMessage(formData: FormContactType): Promise<ActionsReturnType<FormContactType>> {
  const result = formContactSchema.safeParse(formData);

  if (!result.success) {
    const errors = result.error.errors.reduce((acc: Record<string, string>, error) => {
      acc[error.path[0]] = error.message;
      return acc;
    }, {});

    console.log("Errors in the form: ", errors);

    return {
      success: false,
      message: "There are errors in the form.",
      errors,
      data: formData, 
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

    return {
      success: true, 
      message: "Your message has been sent successfully!", 
      data: contactSubmit 
    };
  } catch (error) {
    return {
      success: false, 
      errors: { 
        general: "An error occurred while submitting the message.",
        error
      }, 
      data: formData };
  }
}