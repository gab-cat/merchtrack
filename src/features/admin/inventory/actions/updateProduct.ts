'use server';

import { verifyPermission } from "@/utils/permissions";
import prisma from "@/lib/db";
import { CreateProductType } from "@/features/admin/inventory/products.schema";
import { ExtendedProduct } from "@/types/extended";
import { createLog } from "@/actions/logs.actions";
import { processActionReturnData } from "@/utils";

export async function updateProduct(
  userId: string,
  productId: string,
  data: CreateProductType
): ActionsReturnType<ExtendedProduct> {
  if (!await verifyPermission({
    userId,
    permissions: {
      inventory: { canRead: true, canUpdate: true }
    }
  })) {
    return {
      success: false,
      message: "Permission denied"
    };
  }

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        postedBy: true,
        variants: true,
        reviews: true
      }
    });

    if (!existingProduct) {
      return {
        success: false,
        message: "Product not found for update."
      };
    }

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

    await createLog({
      userId,
      createdById: userId,
      reason: "Product Updated Successfully",
      systemText: `Updated product "${product.title}" (ID: ${product.id})`,
      userText: `Product "${product.title}" has been updated successfully.`
    });

    return { 
      success: true, 
      data: processActionReturnData(product) as ExtendedProduct 
    };
  } catch (error) {
    await createLog({
      userId,
      createdById: userId,
      reason: "Product Update Error",
      systemText: `Error updating product "${data.title}" (ID: ${productId}): ${error instanceof Error ? error.message : 'Unknown error'}`,
      userText: "An error occurred while updating the product."
    });
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to update product" 
    };
  }
} 