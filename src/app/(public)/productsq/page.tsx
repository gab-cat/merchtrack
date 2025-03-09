"use client";

import { SearchIcon } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Carousel from "@/components/ui/carousel";
import Products from "@/app/(public)/productsq/(components)/products";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProductsQuery } from "@/hooks/products.hooks";
import type { PaginatedResponse } from "@/types/common";
import type { ExtendedProduct } from "@/types/extended";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 12;

const Page = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 1000);
  const [currentPage, setCurrentPage] = useState(1);
  const [inventoryType, setInventoryType] = useState("all");

  const queryParams = useMemo(
    () => ({
      limit: ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      page: currentPage,
      where: {
        isDeleted: false,
        ...(debouncedSearch
          ? {
            OR: [
              { title: { contains: debouncedSearch, mode: "insensitive" } },
              { description: { contains: debouncedSearch, mode: "insensitive" } },
              { tags: { has: debouncedSearch } },
            ],
          }
          : {}),
        ...(inventoryType !== "all" ? { inventoryType } : {}),
      },
      orderBy: {
        createdAt: "desc" as const,
      },
    }),
    [currentPage, debouncedSearch, inventoryType],
  );

  const { data, isLoading } = useProductsQuery(queryParams);
  const metadata = (data as PaginatedResponse<ExtendedProduct[]>)?.metadata ?? {
    total: 0,
    page: 1,
    lastPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = (value: string) => {
    setInventoryType(value);
    setCurrentPage(1);
  };

  

  const images = [
    "/img/carousel-image.jpg",
    "/img/carousel-image.jpg",
    "/img/carousel-image.jpg",
    "/img/carousel-image.jpg",
    "/img/carousel-image.jpg",
  ];

  return (
    <div className="flex flex-col items-center bg-gray-50">
      <motion.div
        className="left-0 z-10 w-full overflow-hidden transition-all duration-700 ease-in-out"
      >
        <Carousel images={images} />
      </motion.div>

      <motion.div
        className="w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Our Products</h1>

        <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Button className="hover:bg-primary-dark w-full bg-primary text-white transition-colors sm:w-auto">
            <Link href="/track-order">Track Order</Link>
          </Button>

          <div className="flex w-full items-center gap-4 sm:w-auto">
            <Select value={inventoryType} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="PREORDER">Pre-order</SelectItem>
                <SelectItem value="STOCK">In Stock</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative w-full sm:w-64">
              <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search products"
                onChange={handleSearchChange}
                className="w-full pl-10"
                aria-label="Search products"
              />
            </div>
          </div>
        </div>

        {isLoading ? <ProductGridSkeleton /> : <Products data={data as PaginatedResponse<ExtendedProduct[]>} />}

        <div className="mt-8">
          <Pagination
            page={currentPage}
            total={metadata.lastPage}
            onChange={handlePageChange}
            hasNextPage={currentPage < metadata.lastPage}
            hasPrevPage={currentPage > 1}
          />
        </div>
      </motion.div>
    </div>
  );
};

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="overflow-hidden rounded-lg bg-white shadow-md">
          <Skeleton className="h-48 w-full" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="mt-4 flex items-center justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Page;