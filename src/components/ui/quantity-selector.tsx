'use client';

import React from "react";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  compact?: boolean;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ 
  value, 
  onChange,
  min = 1,
  max = 100,
  compact = false
}) => {
  const decrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const increase = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (newValue: string) => {
    const parsedValue = parseInt(newValue);
    const isValidValue = !isNaN(parsedValue) && 
      parsedValue >= min && 
      parsedValue <= max;

    if (isValidValue) {
      onChange(parsedValue);
    }
  };

  return (
    <div className={`flex items-center rounded-md border ${compact ? 'h-8' : 'h-10'}`}>
      <button
        type="button"
        onClick={decrease}
        disabled={value <= min}
        className={`flex items-center justify-center border-r px-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 ${compact ? 'size-8' : 'size-10'}`}
      >
        -
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        className={`w-12 border-none text-center focus:outline-none focus:ring-0 ${compact ? 'h-8 text-sm' : 'h-10'}`}
        min={min}
        max={max}
      />
      <button
        type="button"
        onClick={increase}
        disabled={value >= max}
        className={`flex items-center justify-center border-l px-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 ${compact ? 'size-8' : 'size-10'}`}
      >
        +
      </button>
    </div>
  );
};

export default QuantitySelector;
