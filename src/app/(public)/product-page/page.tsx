'use client';

import { SearchIcon } from "lucide-react";
import Link from "next/link";
import React from 'react';
import { motion, useScroll, useTransform } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Carousel from "@/components/ui/carousel";
import Products from "@/app/(public)/product-page/(components)/products";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Page = () => {
  const { scrollYProgress } = useScroll(); // Track scroll position

  const carouselHeight = useTransform(scrollYProgress, [0, 0.2], ["100vh", "20vh"]); // 100% to 0%

  // Carousel images
  const images = [
    "/img/carousel-image.jpg",
    "/img/carousel-image.jpg",
    "/img/carousel-image.jpg",
    "/img/carousel-image.jpg",
    "/img/carousel-image.jpg",
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Carousel */}
      <motion.div
        style={{ height: carouselHeight }}
        className="left-0 z-10 w-full overflow-hidden transition-all duration-500"
      >
        <Carousel images={images} />
      </motion.div>

      {/* Spacer to prevent content from overlapping */}
      <motion.div
        //style={{ height: scrollY }}
        className="w-full"
      />

      {/* Content Section */}
      <motion.div
        //style={{ y: scrollY }}
        className="w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <h1 className="mb-4 mt-6 text-2xl font-bold">Products Page</h1>

        {/* Flex container for Button, Dropdown, and Search Input */}
        <div className="flex items-center justify-between">
          {/* Track Order Button */}
          <Button className="text-white">
            <Link href="/track-order">Track Order</Link>
          </Button>

          {/* Right-aligned container for Dropdown and Search Input */}
          <div className="flex items-center gap-4">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="PREORDER">Tops</SelectItem>
                <SelectItem value="STOCK">Bottoms</SelectItem>
              </SelectContent>
            </Select>

            {/* Search Input */}
            <div className="relative w-full sm:w-48 lg:w-64">
              <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
              <Input
                placeholder="Search"
                className="w-full pl-10"
                aria-label="Search products"
              />
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="mt-4">Products</div>
        <Products />
      </motion.div>
    </div>
  );
};

export default Page;