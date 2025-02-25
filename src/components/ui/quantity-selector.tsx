'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const QuantitySelector = () => {
  const [quantity, setQuantity] = useState(1);

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  return (
    <div className="flex items-center gap-16">
      {/* Minus Button */}
      <Button
        onClick={decreaseQuantity}
        className="flex size-10 items-center justify-center rounded-md border border-gray-300 bg-white text-lg font-bold text-[gray] hover:bg-blue-500 hover:text-white"
      >
                −
      </Button>

      {/* Quantity Display */}
      <span className="flex h-10 w-12 items-center justify-center rounded-md border border-gray-300 text-lg font-medium">
        {quantity}
      </span>

      {/* Plus Button */}
      <Button
        onClick={increaseQuantity}
        className="flex size-10 items-center justify-center rounded-md border border-gray-300 bg-white text-lg font-bold text-[gray] hover:bg-blue-500 hover:text-white"
      >
                +
      </Button>
    </div>
  );
};

export default QuantitySelector;
