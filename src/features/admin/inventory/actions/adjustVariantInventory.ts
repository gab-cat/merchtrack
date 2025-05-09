'use server';

import { verifyPermission } from "@/utils/permissions";
import prisma from "@/lib/db";
import { createLog } from "@/actions/logs.actions";

export async function adjustVariantInventory(
  userId: string,
  productId: string, // productId is good for logging context
  variantId: string,
  adjustment: number,
  reason?: string
): ActionsReturnType<{ newInventory: number }> {
  if (!await verifyPermission({
    userId,
    permissions: {
      inventory: { canRead: true, canUpdate: true }
    }
  })) {
    return {
      success: false,
      message: "Permission denied to adjust inventory"
    };
  }

  try {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true } // Include product for logging
    });

    if (!variant) {
      return {
        success: false,
        message: "Variant not found"
      };
    }

    const newInventory = variant.inventory + adjustment;
    if (newInventory < 0) {
      return {
        success: false,
        message: "Inventory cannot be negative"
      };
    }

    await prisma.productVariant.update({
      where: { id: variantId },
      data: { inventory: newInventory }
    });
    
    const logReason = reason || (adjustment > 0 ? "Stock Increased" : "Stock Decreased");
    await createLog({
      userId,
      createdById: userId,
      reason: `Inventory Adjusted: ${logReason}`,
      systemText: `Adjusted inventory for variant "${variant.variantName}" (Product: "${variant.product.title}", ID: ${variantId}) by ${adjustment}. New inventory: ${newInventory}. Reason: ${logReason}`,
      userText: `Inventory for "${variant.variantName}" adjusted by ${adjustment}. Reason: ${logReason}.`
    });

    return { 
      success: true, 
      data: { newInventory } 
    };
  } catch (error) {
    await createLog({
      userId,
      createdById: userId,
      reason: "Inventory Adjustment Error",
      systemText: `Error adjusting inventory for variant ID ${variantId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      userText: "An error occurred while adjusting inventory."
    });
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to adjust inventory" 
    };
  }
} 