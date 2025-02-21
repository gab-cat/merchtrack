'use server';

import { Category } from "@prisma/client";
import { verifyPermission } from "@/utils/permissions";
import prisma from "@/lib/db";
import { createNewCategorySchema } from "@/schema/category.schema";
import { processActionReturnData, slugify } from "@/utils";
import { CreateProductType } from "@/schema/products.schema";
import { ExtendedProduct } from "@/types/extended";
import { createLog } from "@/actions/logs.actions";
import { invalidateCache } from "@/lib/redis";

type CreateCategoryParams = {
    userId: string;
    name: string;
};

export async function createCategory(params: CreateCategoryParams): Promise<ActionsReturnType<Category>> {
  const result = createNewCategorySchema.safeParse(params);
  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0].message
    };
  }

  const { name } = result.data;

  const hasPermission = await verifyPermission({
    userId: params.userId,
    permissions: {
      dashboard: { canRead: true },
    }
  });

  if (!hasPermission) {
    return { 
      success: false,
      message: 'Permission denied'
    };
  }

  try {
    const category = await prisma.category.create({
      data: {
        name
      }
    });
    
    return { 
      success: true, 
      data: processActionReturnData(category) as Category
    };
  } catch {
    return { success: false, message: 'An error occurred while creating the category' };
  }
}

export async function createProduct(userId: string, data: CreateProductType): Promise<ActionsReturnType<ExtendedProduct>> {
  // ...existing permission checks...

  try {
    const product = await prisma.product.create({
      data: {
        title: data.title,
        description: data.description,
        inventory: data.inventory,
        inventoryType: data.inventoryType,
        imageUrl: data.imageUrl,
        tags: data.tags,
        categoryId: data.categoryId,
        slug: slugify(data.title),
        postedById: userId,
        variants: {
          create: data.variants.map(variant => ({
            variantName: variant.variantName,
            price: variant.price,
            inventory: variant.inventory,
            rolePricing: variant.rolePricing
          }))
        }
      },
      include: {
        category: true,
        postedBy: true,
        variants: true,
        reviews: true
      }
    });

    return {
      success: true,
      data: processActionReturnData(product) as ExtendedProduct
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while creating the product"
    };
  }
}

export async function updateProduct(
  userId: string,
  productId: string,
  data: CreateProductType
): Promise<ActionsReturnType<ExtendedProduct>> {
  if (!await verifyPermission({
    userId,
    permissions: {
      dashboard: { canRead: true }
    }
  })) {
    return {
      success: false,
      message: "Permission denied"
    };
  }

  try {
    // Start a transaction to handle variant updates safely
    const product = await prisma.$transaction(async (tx) => {
      // Update the main product first
      await tx.product.update({
        where: { id: productId },
        data: {
          title: data.title,
          description: data.description,
          inventory: data.inventory,
          inventoryType: data.inventoryType,
          imageUrl: data.imageUrl,
          tags: data.tags,
          categoryId: data.categoryId,
        },
      });

      // Update existing variants and create new ones if any
      for (const variant of data.variants) {
        if (variant.id) {
          // Update existing variant
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              variantName: variant.variantName,
              price: variant.price,
              inventory: variant.inventory,
              rolePricing: variant.rolePricing
            }
          });
        } else {
          // Create new variant if it doesn't have an ID
          await tx.productVariant.create({
            data: {
              productId: productId,
              variantName: variant.variantName,
              price: variant.price,
              inventory: variant.inventory,
              rolePricing: variant.rolePricing
            }
          });
        }
      }

      // Return the updated product with all relations
      return await tx.product.findUnique({
        where: { id: productId },
        include: {
          category: true,
          postedBy: true,
          variants: true,
          reviews: true
        }
      });
    });

    if (!product) {
      throw new Error("Failed to update product");
    }

    // Get total number of product pages
    const totalProducts = await prisma.product.count();
    const totalPages = Math.ceil(totalProducts / 12); // Assuming 10 products per page
    
    // Invalidate cache
    const keysToInvalidate = [
      `products:all`,
      `product:${product.id}`,
      `product:${product.slug}`,
      'products:total',
      ...Array.from({ length: totalPages }, (_, i) => `products:${i + 1}:*`)
    ];
    await invalidateCache(keysToInvalidate);
    
    await createLog({
      userId,
      createdById: userId,
      reason: "Product Updated Successfully",
      // @ts-expect-error - data is not defined in ExtendedProduct
      systemText: `Updated product "${product.title}" (ID: ${product.id}). Changes: ${Object.keys(data).filter(key => data[key] !== existingProduct[key]).join(', ')}`,
      userText: `Product "${product.title}" has been updated successfully.`
    });

    return {
      success: true,
      data: processActionReturnData(product) as ExtendedProduct
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while updating the product"
    };
  }
}