'use server';

import { Category } from "@prisma/client";
import prisma from "@/lib/db";


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