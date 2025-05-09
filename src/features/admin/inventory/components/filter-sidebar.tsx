'use client';

import { useState } from "react";
import { FaBoxes, FaTags, FaBoxOpen } from "react-icons/fa";
import { FaPesoSign } from "react-icons/fa6";
import { MdCategory } from "react-icons/md";
import { FilterSection, type FilterItem } from ".";
import { Slider } from "@/components/ui/slider";
import { useCategoriesQuery } from "@/hooks/categories.hooks";
import type { ExtendedProduct } from "@/types/extended";
import type { StockStatus } from "@/types/products";

interface FilterSidebarProps {
  products: ExtendedProduct[]
  filters: {
    inventoryType: ("PREORDER" | "STOCK")[]
    categories: string[]
    priceRange: [number, number]
    tags: string[]
    stockStatus: StockStatus[]
  }
  setFilters: React.Dispatch<
    React.SetStateAction<{
      inventoryType: ("PREORDER" | "STOCK")[]
      categories: string[]
      priceRange: [number, number]
      tags: string[]
      stockStatus: StockStatus[]
    }>
  >
  className?: string
}

const stockStatusOptions: FilterItem[] = [
  { value: "IN_STOCK", label: "In Stock (> 5)" },
  { value: "LOW_STOCK", label: "Low Stock (≤ 5)" },
  { value: "OUT_OF_STOCK", label: "Out of Stock" }
];

const inventoryTypeOptions: FilterItem[] = [
  { value: "PREORDER", label: "Pre-order" },
  { value: "STOCK", label: "In Stock" }
];

export function FilterSidebar({ products, filters, setFilters, className = "" }: Readonly<FilterSidebarProps>) {
  const [priceRange, setPriceRange] = useState<[number, number]>(filters.priceRange);
  const { data: categories = [] } = useCategoriesQuery();
  const allTags = Array.from(new Set(products.flatMap((p) => p.tags)));

  const handleInventoryTypeChange = (value: string) => {
    if (value === "PREORDER" || value === "STOCK") {
      setFilters((prev) => ({
        ...prev,
        inventoryType: prev.inventoryType.includes(value)
          ? prev.inventoryType.filter((t) => t !== value)
          : [...prev.inventoryType, value],
      }));
    }
  };

  const handleStockStatusChange = (value: string) => {
    const status = value as StockStatus;
    setFilters((prev) => ({
      ...prev,
      stockStatus: prev.stockStatus.includes(status)
        ? prev.stockStatus.filter((s) => s !== status)
        : [...prev.stockStatus, status],
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((c) => c !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleTagChange = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handlePriceRangeChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setPriceRange(newRange);
    setFilters((prev) => ({ ...prev, priceRange: newRange }));
  };

  return (
    <div className={`space-y-8 ${className}`}>
      <FilterSection
        title="Inventory Type"
        icon={<FaBoxes className="mr-2" />}
        items={inventoryTypeOptions}
        checkedValues={filters.inventoryType}
        onFilterChange={handleInventoryTypeChange}
      />

      <FilterSection
        title="Stock Status"
        icon={<FaBoxOpen className="mr-2" />}
        items={stockStatusOptions}
        checkedValues={filters.stockStatus}
        onFilterChange={handleStockStatusChange}
      />

      {categories.length > 0 && (
        <FilterSection
          title="Categories"
          icon={<MdCategory className="mr-2" />}
          items={categories.map(c => ({ value: c.id, label: c.name }))}
          checkedValues={filters.categories}
          onFilterChange={handleCategoryChange}
        />
      )}

      <div>
        <h3 className="mb-4 flex items-center text-lg font-semibold text-primary">
          <FaPesoSign className="mr-2" />Price Range
        </h3>
        <Slider
          min={0}
          max={5000}
          step={100}
          value={priceRange}
          onValueChange={handlePriceRangeChange}
          className="mt-2"
        />
        <div className="mt-2 flex justify-between text-sm font-medium">
          <span>₱{priceRange[0].toLocaleString()}</span>
          <span>₱{priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {allTags.length > 0 && (
        <FilterSection
          title="Tags"
          icon={<FaTags className="mr-2" />}
          items={allTags.map(tag => ({ value: tag, label: tag }))}
          checkedValues={filters.tags}
          onFilterChange={handleTagChange}
        />
      )}
    </div>
  );
}

