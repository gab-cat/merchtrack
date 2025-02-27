'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExtendedProductVariant } from "@/types/extended";


interface SizeSelectorProps {
    variants: ExtendedProductVariant[]; // Expect an array of strings
}

const SizeSelector: React.FC<SizeSelectorProps> = ({ variants }) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  return (
    <div className="flex gap-2">
      {variants.map((variant) => (
        <Button
          key={variant.id}
          onClick={() => { setSelectedSize(variant.id); }}
          className={`flex items-center justify-center rounded-lg border shadow-none transition-colors
                        ${selectedSize === variant.id
          ? "border-primary bg-primary-100 text-primary hover:bg-primary-100 " // Active (selected) state
          : " bg-white text-gray-700  hover:bg-primary-100 "
        }`}
        >
          {variant.variantName}
        </Button>
      ))}
    </div>
  );
};

export default SizeSelector;
