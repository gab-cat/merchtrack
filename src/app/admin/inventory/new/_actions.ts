'use server';

import { Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { setCached } from "@/lib/redis";
import { generateUniqueSlug } from "@/utils/slug.utils";
import { createProductSchema, type CreateProductType } from "@/schema/products.schema";
import { verifyPermission } from "@/utils/permissions";
import type { ExtendedProduct } from "@/types/extended";
import { uploadToR2 } from "@/lib/s3";

export async function createProduct(
  userId: string,
  data: CreateProductType
): Promise<ActionsReturnType<ExtendedProduct>> {
  if (!await verifyPermission({
    userId: userId,
    permissions: {
      dashboard: { canRead: true },
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to create products."
    };
  }

  const safeData = await createProductSchema.safeParseAsync(data);
  if (!safeData.success) {
    return {
      success: false,
      message: safeData.error.errors[0].message
    };
  }

  try {
    // Generate unique slug from title
    const slug = await generateUniqueSlug(
      data.title,
      async (slug) => {
        const exists = await prisma.product.findUnique({
          where: { slug }
        });
        return !!exists;
      }
    );

    delete data._tempFiles;

    const product = await prisma.product.create({
      data: {
        ...data,
        slug,
        postedById: userId,
        variants: {
          create: data.variants.map(variant => ({
            ...variant,
            price: new Prisma.Decimal(variant.price)
          }))
        }
      },
      include: {
        category: true,
        postedBy: true,
        reviews: true,
        variants: true
      }
    });

    // Invalidate cache
    await setCached(`products:all`, null);
    await setCached(`product:${product.id}`, product);
    await setCached(`product:${product.slug}`, product);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(product))
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message
    };
  }
}

export async function uploadImages(userId: string, formData: FormData): Promise<ActionsReturnType<string[]>> {
  if (!await verifyPermission({
    userId: userId,
    permissions: {
      dashboard: { canRead: true },
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to upload images."
    };
  }

  try {
    const files = formData.getAll('files') as File[];
    const uploadPromises = files.map(async (file) => {
      const key = `products/${Date.now()}-${file.name}`;
      const url = await uploadToR2(file, key);
      return url;
    });

    const urls = await Promise.all(uploadPromises);
    return {
      success: true,
      data: urls
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message
    };
  }
}