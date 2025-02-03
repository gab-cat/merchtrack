'use client';

import { useState, useCallback, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal } from 'lucide-react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { ProductCard } from "./product-card";
import { FilterSidebar } from "./filter-sidebar";
import { useProductsQuery } from "@/hooks/products.hooks";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaginationNav } from "@/components/pagination-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExtendedProduct } from "@/types/extended";
import type { PaginatedResponse } from "@/types/common";

export default function ProductsGrid() {
  const [params, setParams] = useState({
    page: 1,
    limit: 12,
    inventoryType: "all",
    limitFields: ["createdAt", "updatedAt"],
  });

  const [filters, setFilters] = useState({
    inventoryType: [] as ("PREORDER" | "STOCK")[],
    categories: [] as string[],
    priceRange: [0, 10000] as [number, number],
    tags: [] as string[]
  });

  const [parent] = useAutoAnimate();
  const [localSearch, setLocalSearch] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const { data, isLoading } = useProductsQuery(params);
  const products = (data as PaginatedResponse<ExtendedProduct[]>)?.data ?? [];
  const metadata = (data as PaginatedResponse<ExtendedProduct[]>)?.metadata ?? {};
  const { total = 0, page = 1, lastPage = 1 } = metadata;

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const searchLower = localSearch.toLowerCase();
      return (
        (filters.inventoryType.length === 0 || filters.inventoryType.includes(product.inventoryType)) &&
        (filters.categories.length === 0 || (product.category && filters.categories.includes(product.category.name))) &&
        (filters.tags.length === 0 || filters.tags.some(tag => product.tags.includes(tag))) &&
        (product.title.toLowerCase().includes(searchLower) || product.description?.toLowerCase().includes(searchLower))
      );
    });
  }, [products, filters, localSearch]);

  const handlePageChange = useCallback((newPage: number) => {
    setParams(prev => ({ ...prev, page: newPage }));
  }, []);

  const handleFilterChange = (value: string) => {
    setParams(prev => ({ ...prev, page: 1, inventoryType: value }));
  };

  useEffect(() => {
    // Reset to first page when filters change
    setParams(prev => ({ ...prev, page: 1 }));
  }, [filters]); //Corrected dependency

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-2 top-2.5 size-4" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={params.inventoryType}
            onValueChange={handleFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="PREORDER">Pre-order</SelectItem>
              <SelectItem value="STOCK">In Stock</SelectItem>
            </SelectContent>
          </Select>
          <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <SlidersHorizontal className="mr-2 size-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <FilterSidebar 
                products={products}
                filters={filters}
                setFilters={setFilters}
                className="mt-4"
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[300px_1fr]">
        <FilterSidebar 
          products={products}
          filters={filters}
          setFilters={setFilters}
          className="hidden md:block"
        />
        
        <div>
          {isLoading ? (
            <ProductGridSkeleton />
          ) : (
            <>
              <div ref={parent} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product: ExtendedProduct) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {filteredProducts.length === 0 && (
                <div className="py-10 text-center">
                  <h3 className="text-lg font-semibold">No products found</h3>
                  <p className="text-muted-foreground mt-2">Try adjusting your search or filter to find what you&apos;re looking for.</p>
                </div>
              )}
            </>
          )}

          <PaginationNav
            currentPage={page}
            totalPages={lastPage}
            totalItems={total}
            onPageChange={handlePageChange}
            className="mt-8"
          />
        </div>
      </div>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
