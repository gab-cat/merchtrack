"use server";

import prisma from "@/lib/db";
import { invalidateCache } from "@/lib/redis";
import { formContactSchema, FormContactType } from "@/schema/public-contact";

/**
 * Submits a contact form message after validation and database storage.
 *
 * @remarks
 * This function validates the contact form data, creates a database record, and returns a result indicating success or failure.
 *
 * @param formData - The contact form submission data to be processed
 * @returns An object indicating the submission status, with either a success message and created data or validation/submission errors
 *
 * @throws {Error} Handles potential database or validation errors gracefully
 *
 * @beta
 */
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
        ...sanitizedData,
        isSentByCustomer: true,
      },
    });


    const pageSizes = [10, 20, 50, 100];
    const totalMessages = await prisma.message.count();
    const cacheKeys = [
      `messages:customer:${sanitizedData.email}`,
      'messages:all',
      'messages:total'
    ];

    for (const limit of pageSizes) {
      const totalPages = Math.ceil(totalMessages / limit);
      for (let page = 1; page <= totalPages + 1; page++) {
        cacheKeys.push(`messages:${page}:${limit}`);
      }
    }

    await invalidateCache(cacheKeys);

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
      data: sanitizedData 
    };
  }
}