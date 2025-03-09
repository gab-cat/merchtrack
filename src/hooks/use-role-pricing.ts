interface RolePricingInput {
  variant: {
    price: number | string;
    rolePricing: Record<string, number>;
  };
  customerRole: string | null;
  customerCollege: string | null;
  productPostedByCollege: string | null;
}

interface RolePricingResult {
  price: number;
  appliedRole: string;
  formattedPrice: string;
  originalPrice?: string;
}

export function useRolePricing({
  variant,
  customerRole,
  customerCollege,
  productPostedByCollege
}: RolePricingInput): RolePricingResult {
  // Convert price to number if it's a string
  const basePrice = typeof variant.price === 'string' ? parseFloat(variant.price) : variant.price;
  
  // Default to the base price and "OTHERS" role
  let finalPrice = basePrice;
  let appliedRole = "OTHERS";

  // If customer has no role or college, use other pricing
  if (!customerRole || !customerCollege || !productPostedByCollege) {
    return {
      price: finalPrice,
      appliedRole,
      formattedPrice: `₱${finalPrice.toFixed(2)}`,
      originalPrice: `₱${basePrice.toFixed(2)}`
    };
  }

  // Check if customer's college matches the product's college
  const isFromSameCollege = customerCollege === productPostedByCollege;

  // If from different college, use other pricing
  if (!isFromSameCollege) {
    // Look for OTHERS role pricing or fallback to base price
    finalPrice = variant.rolePricing?.["OTHERS"] ?? basePrice;
    appliedRole = "OTHERS";
  } else {
    // If from same college, use role-specific pricing
    const rolePricing = variant.rolePricing?.[customerRole];
    if (rolePricing !== undefined) {
      finalPrice = rolePricing;
      appliedRole = customerRole;
    }
  }

  return {
    price: finalPrice,
    appliedRole,
    formattedPrice: `₱${finalPrice.toFixed(2)}`,
    originalPrice: `₱${basePrice.toFixed(2)}`
  };
}