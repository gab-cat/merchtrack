'use server';

import { Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { setCached } from "@/lib/redis";
import { generateUniqueSlug } from "@/utils/slug.utils";
import { createProductSchema, type CreateProductType } from "@/schema/products.schema";
import { verifyPermission } from "@/utils/permissions";
import type { ExtendedProduct } from "@/types/extended";
import { uploadToR2 } from "@/lib/s3";


/**
 * Creates a new product with the specified details and updates the cache.
 *
 * This asynchronous function first verifies if the user (specified by `userId`) has the necessary permissions to create a product.
 * It then validates the provided product data using a schema. If the user is not authorized or the data validation fails,
 * the function returns a failure response with an appropriate error message.
 *
 * Upon successful validation, a unique slug is generated based on the product title by checking for existing slugs in the database.
 * Temporary file data is removed from the product data before proceeding. The function then creates a new product record in the database,
 * including processing associated variants (with the variant price converted to a Decimal type), and sets up relationships with the category,
 * the user who posted it, and reviews. After successful creation, several cache entries related to products are updated.
 *
 * @param userId - The ID of the user attempting to create the product.
 * @param data - The product information conforming to CreateProductType, including title, variants, and related details.
 * @returns A promise that resolves to an object containing a success flag and either the created product data (on success) or an error message (on failure).
 */
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

    await Promise.all([
      setCached(`products:all`, null),
      setCached(`product:${product.id}`, product),
      setCached(`product:${product.slug}`, product),
      setCached('products:total', null),
      ...Array.from({ length: 10 }, (_, i) => 
        setCached(`products:${i + 1}:*`, null)
      )
    ]);

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

/**
 * Asynchronously uploads images to R2 storage for a verified user.
 *
 * This function first checks if the user has the necessary permissions to upload images.
 * If the user is not authorized, it returns an error message. Upon successful authorization,
 * it retrieves all files from the provided FormData under the key 'files', uploads each file
 * to R2 storage using a unique key format "products/{timestamp}-{fileName}", and collects the URLs
 * of the uploaded images. If any error occurs during upload, it returns a failure response with 
 * the error message.
 *
 * @param userId - The identifier of the user performing the upload.
 * @param formData - The FormData object containing the image files (expected under the key 'files').
 * @returns A promise that resolves to an object indicating the success status. On success, the object
 *          includes an array of URL strings for the uploaded images; on failure, it contains an error message.
 */
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