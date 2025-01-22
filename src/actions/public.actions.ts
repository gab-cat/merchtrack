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

    return {
      success: false,
      message: "There are errors in the form.",
      errors,
      data: formData, 
    };
  }

  const { email, subject, message } = result.data;
  
  // Sanitize inputs
  const sanitizedData = {
    email: email.trim().toLowerCase(),
    subject: subject.trim(),
    message: message.trim()
  };

  try {
    const contactSubmit = await prisma.message.create({
      data: {
        ...sanitizedData
      },
    });

    return {
      success: true, 
      message: "Your message has been sent successfully!", 
      data: contactSubmit 
    };

  } catch (error) {
    // no-dd-sa:typescript-best-practices/no-console
    console.error('Failed to submit contact message:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      email: sanitizedData.email 
    });
    return {
      success: false, 
      errors: { 
        general: "An error occurred while submitting the message.",
        error
      }, 
      data: formData };
  }
}