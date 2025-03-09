import { Role, College } from "@/types/Misc";

export type PricingResult = {
  price: number;
  appliedRole: string;
  discount?: number;
};

export type RolePricing = {
  [Role.PLAYER]?: number;
  [Role.STUDENT]?: number;
  [Role.STAFF_FACULTY]?: number;
  [Role.ALUMNI]?: number;
  OTHERS: number;
};

interface PriceCalculationContext {
  basePrice: number;
  rolePricing: RolePricing;
  customerInfo?: {
    role: string;
    college: string;
  };
  productCollege?: string;
}

const isValidRolePricing = (pricing: RolePricing): boolean => {
  return pricing && typeof pricing.OTHERS === 'number';
};

const isFromSameCollege = (customerCollege?: string, productCollege?: string): boolean => {
  return Boolean(
    customerCollege && 
    productCollege && 
    customerCollege === productCollege && 
    customerCollege !== College.NOT_APPLICABLE
  );
};

const hasRoleSpecificPricing = (role: string, pricing: RolePricing): boolean => {
  return role in pricing && typeof pricing[role as keyof RolePricing] === 'number';
};

const calculateDiscount = (basePrice: number, finalPrice: number): number | undefined => {
  const discount = ((basePrice - finalPrice) / basePrice) * 100;
  return discount > 0 ? Math.round(discount) : undefined;
};

export const calculateRoleBasedPrice = ({
  basePrice,
  rolePricing,
  customerInfo,
  productCollege
}: PriceCalculationContext): PricingResult => {
  try {
    // Validate role pricing
    if (!isValidRolePricing(rolePricing)) {
      return {
        price: basePrice,
        appliedRole: "OTHERS"
      };
    }

    // If no customer info, use default pricing
    if (!customerInfo?.role || !customerInfo?.college) {
      return {
        price: rolePricing.OTHERS,
        appliedRole: "OTHERS"
      };
    }

    // Check if customer is from the same college
    const sameCollege = isFromSameCollege(customerInfo.college, productCollege);

    // If from same college and has role-specific pricing, use that
    if (sameCollege && hasRoleSpecificPricing(customerInfo.role, rolePricing)) {
      const rolePrice = rolePricing[customerInfo.role as keyof RolePricing];
      if (rolePrice !== undefined) {
        return {
          price: rolePrice,
          appliedRole: customerInfo.role,
          discount: calculateDiscount(basePrice, rolePrice)
        };
      }
    }

    // Default to OTHERS pricing
    return {
      price: rolePricing.OTHERS,
      appliedRole: "OTHERS"
    };
  } catch (error) {
    console.error('Error calculating role-based price:', error);
    return {
      price: basePrice,
      appliedRole: "OTHERS"
    };
  }
};