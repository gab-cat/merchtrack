'use server';

import { Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { generateUniqueSlug } from "@/utils/slug.utils";
import { createProductSchema, type CreateProductType } from "@/features/admin/inventory/products.schema";
import { verifyPermission } from "@/utils/permissions";
import type { ExtendedProduct } from "@/types/extended";
import { createLog } from "@/actions/logs.actions";
import { processActionReturnData } from "@/utils";

/**
 * Creates a new product with the specified details, updates the cache, and logs significant events.
 *
 * This asynchronous function first checks if the user (identified by `userId`) has permission to create a product.
 * If unauthorized, it logs the attempt and returns a failure response.
 *
 * The function then validates the provided product data using a schema. On validation failure, it logs the error details
 * and returns a failure response with the corresponding error message.
 *
 * Upon successful validation, it generates a unique slug based on the product title by ensuring that the slug does not already exist
 * in the database. It then removes temporary file data from the input before creating a new product record in the database.
 * The product record is created with processed variants (with variant prices converted to Decimal types) and appropriate relations
 * to its category, the posting user, and reviews.
 *
 * After creating the product, several cache entries related to products are updated, and a successful creation log is recorded.
 * Any errors encountered during the process are caught, logged, and result in a standardized error response.
 *
 * @param userId - The ID of the user attempting to create the product.
 * @param data - The product information adhering to CreateProductType, which includes title, variants, and other related details.
 * @returns A promise that resolves to an object containing:
 *   - success: A boolean indicating whether the operation succeeded.
 *   - data: The created product data on success.
 *   - message: An error message on failure.
 *
 * @example
 * const result = await createProduct("user123", productData);
 * if (result.success) {
 *   console.log("Product created:", result.data);
 * } else {
 *   console.error("Error creating product:", result.message);
 * }
 */
export async function createProduct(
  userId: string,
  data: CreateProductType
): ActionsReturnType<ExtendedProduct> {
  if (!await verifyPermission({
    userId: userId,
    permissions: {
      inventory: { canRead: true, canCreate: true },
    }
  })) {
    await createLog({
      userId,
      createdById: userId,
      reason: "Product Creation Failed - Unauthorized",
      systemText: `Unauthorized attempt to create product "${data.title}"`,
      userText: "You are not authorized to create products."
    });
    return {
      success: false,
      message: "You are not authorized to create products."
    };
  }

  try {
    const safeData = await createProductSchema.safeParseAsync(data);
    if (!safeData.success) {
      await createLog({
        userId,
        createdById: userId,
        reason: "Product Creation Failed - Invalid Data",
        systemText: `Failed to create product "${data.title}": ${safeData.error.errors[0].message}`,
        userText: safeData.error.errors[0].message
      });
      return {
        success: false,
        message: safeData.error.errors[0].message
      };
    }

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

    await createLog({
      userId,
      createdById: userId,
      reason: "Product Created Successfully",
      systemText: `Created new product "${product.title}" (ID: ${product.id}) with ${product.variants.length} variants`,
      userText: `Product "${product.title}" has been created successfully.`
    });

    return {
      success: true,
      data: processActionReturnData(product) as ExtendedProduct
    };
  } catch (error) {
    await createLog({
      userId,
      createdById: userId,
      reason: "Product Creation Error",
      systemText: `Error creating product "${data.title}": ${error instanceof Error ? error.message : 'Unknown error'}`,
      userText: "An error occurred while creating the product."
    });
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create product'
    };
  }
} 