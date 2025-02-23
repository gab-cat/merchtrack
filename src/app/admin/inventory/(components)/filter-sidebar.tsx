import { useState } from "react";
import { FaBoxes, FaTags } from "react-icons/fa";
import { FaPesoSign } from "react-icons/fa6";
import { MdCategory } from "react-icons/md";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useCategoriesQuery } from "@/hooks/categories.hooks";
import type { ExtendedProduct } from "@/types/extended";

interface FilterSidebarProps {
  products: ExtendedProduct[]
  filters: {
    inventoryType: ("PREORDER" | "STOCK")[]
    categories: string[]
    priceRange: [number, number]
    tags: string[]
    stockStatus: ("IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK")[]
  }
  setFilters: React.Dispatch<
    React.SetStateAction<{
      inventoryType: ("PREORDER" | "STOCK")[]
      categories: string[]
      priceRange: [number, number]
      tags: string[]
      stockStatus: ("IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK")[]
    }>
  >
  className?: string
}

export function FilterSidebar({ products, filters, setFilters, className = "" }: Readonly<FilterSidebarProps>) {
  const [priceRange, setPriceRange] = useState(filters.priceRange);
  const { data: categories = [] } = useCategoriesQuery();
  
  const allTags = Array.from(new Set(products.flatMap((p) => p.tags)));

  const handleInventoryTypeChange = (type: "PREORDER" | "STOCK") => {
    setFilters((prev) => ({
      ...prev,
      inventoryType: prev.inventoryType.includes(type)
        ? prev.inventoryType.filter((t) => t !== type)
        : [...prev.inventoryType, type],
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
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  };

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
    setFilters((prev) => ({ ...prev, priceRange: [value[0], value[1]] }));
  };

  const handleStockStatusChange = (status: "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK") => {
    setFilters((prev) => ({
      ...prev,
      stockStatus: prev.stockStatus.includes(status)
        ? prev.stockStatus.filter((s) => s !== status)
        : [...prev.stockStatus, status],
    }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="mb-2 flex items-center font-bold text-primary"><FaBoxes className="mr-2"/>Inventory Type</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <Checkbox
              id="preorder"
              checked={filters.inventoryType.includes("PREORDER")}
              onCheckedChange={() => handleInventoryTypeChange("PREORDER")}
            />
            <label htmlFor="preorder" className="ml-2 text-sm">
              Pre-order
            </label>
          </div>
          <div className="flex items-center">
            <Checkbox
              id="instock"
              checked={filters.inventoryType.includes("STOCK")}
              onCheckedChange={() => handleInventoryTypeChange("STOCK")}
            />
            <label htmlFor="instock" className="ml-2 text-sm">
              In Stock
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-2 flex items-center font-bold text-primary"><MdCategory className="mr-2"/>Category</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center">
              <Checkbox
                id={`category-${category.id}`}
                checked={filters.categories.includes(category.id)}
                onCheckedChange={() => handleCategoryChange(category.id)}
              />
              <label htmlFor={`category-${category.id}`} className="ml-2 text-sm">
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 flex items-center font-bold text-primary"><FaPesoSign className="mr-2"/>Price Range</h3>
        <Slider
          min={0}
          max={1000}
          step={10}
          value={priceRange}
          onValueChange={handlePriceRangeChange}
          className="mt-2"
        />
        <div className="mt-2 flex justify-between text-sm">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      <div>
        <h3 className="mb-2 flex items-center font-bold text-primary"><FaTags className="mr-2"/>Tags</h3>
        <div className="space-y-2">
          {allTags.map((tag) => (
            <div key={tag} className="flex items-center">
              <Checkbox
                id={`tag-${tag}`}
                checked={filters.tags.includes(tag)}
                onCheckedChange={() => handleTagChange(tag)}
              />
              <label htmlFor={`tag-${tag}`} className="ml-2 text-sm">
                {tag}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 flex items-center font-bold text-primary">
          <FaBoxes className="mr-2"/>Stock Status
        </h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <Checkbox
              id="in-stock"
              checked={filters.stockStatus.includes("IN_STOCK")}
              onCheckedChange={() => handleStockStatusChange("IN_STOCK")}
            />
            <label htmlFor="in-stock" className="ml-2 text-sm">
              In Stock
            </label>
          </div>
          <div className="flex items-center">
            <Checkbox
              id="low-stock"
              checked={filters.stockStatus.includes("LOW_STOCK")}
              onCheckedChange={() => handleStockStatusChange("LOW_STOCK")}
            />
            <label htmlFor="low-stock" className="ml-2 text-sm">
              Low Stock (≤ 5)
            </label>
          </div>
          <div className="flex items-center">
            <Checkbox
              id="out-of-stock"
              checked={filters.stockStatus.includes("OUT_OF_STOCK")}
              onCheckedChange={() => handleStockStatusChange("OUT_OF_STOCK")}
            />
            <label htmlFor="out-of-stock" className="ml-2 text-sm">
              Out of Stock
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

