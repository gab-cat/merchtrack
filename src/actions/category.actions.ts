'use server';

import { Category } from "@prisma/client";
import prisma from "@/lib/db";


/**
 * Retrieves all categories from the database.
 *
 * This asynchronous function uses Prisma to fetch all category records using the `findMany` method.
 * If the operation is successful, it returns an object with `success` set to true and the categories
 * provided in the `data` field (properly formatted as JSON). If an error occurs during the database query,
 * the function catches the error and returns an object with `success` set to false along with the error message.
 *
 * @returns An object containing the operation status and either the list of categories (on success) or an error message (on failure).
 */
export async function getCategories(): Promise<ActionsReturnType<Category[]>> {
  try {
    const categories = await prisma.category.findMany();
    return {
      success: true,
      data: JSON.parse(JSON.stringify(categories)),
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message,
    };
  }

}