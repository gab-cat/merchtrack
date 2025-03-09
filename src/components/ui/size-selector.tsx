'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExtendedProductVariant } from "@/types/extended";
import { useRolePricing } from "@/hooks/use-role-pricing";

interface SizeSelectorProps {
  variants: ExtendedProductVariant[];
  onVariantChange?: (variant: ExtendedProductVariant, price: number, appliedRole: string) => void;
  customerRole?: string | null;
  customerCollege?: string | null;
  productPostedByCollege?: string | null;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({ 
  variants,
  onVariantChange,
  customerRole,
  customerCollege,
  productPostedByCollege
}) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  
  // Set initial selection to first variant
  useEffect(() => {
    if (variants.length > 0 && !selectedSize) {
      const firstVariant = variants[0];
      setSelectedSize(firstVariant.id);
      if (onVariantChange) {
        const pricing = useRolePricing({
          variant: firstVariant,
          customerRole,
          customerCollege,
          productPostedByCollege
        });
        onVariantChange(firstVariant, pricing.price, pricing.appliedRole);
      }
    }
  }, [variants, selectedSize]);

  const handleVariantSelect = (variant: ExtendedProductVariant) => {
    setSelectedSize(variant.id);
    if (onVariantChange) {
      const pricing = useRolePricing({
        variant,
        customerRole,
        customerCollege,
        productPostedByCollege
      });
      onVariantChange(variant, pricing.price, pricing.appliedRole);
    }
  };

  return (
    <div className="flex gap-2">
      {variants.map((variant) => {
        const pricing = useRolePricing({
          variant,
          customerRole,
          customerCollege,
          productPostedByCollege
        });

        return (
          <Button
            key={variant.id}
            onClick={() => handleVariantSelect(variant)}
            className={`flex flex-col items-center justify-center rounded-lg border shadow-none transition-colors
              ${selectedSize === variant.id
            ? "border-primary bg-primary-100 text-primary hover:bg-primary-100"
            : "bg-white text-gray-700 hover:bg-primary-100"
          }`}
          >
            <span>{variant.variantName}</span>
            <span className="text-muted-foreground text-sm">{pricing.formattedPrice}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default SizeSelector;
