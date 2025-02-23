"use client";

import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PaginatedResponse } from "@/types/common";
import type { ExtendedProduct } from "@/types/extended";

type ProductsProps = {
  data: PaginatedResponse<ExtendedProduct[]>
}

export default function Products({ data }: Readonly<ProductsProps>) {
  const products = data?.data;

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center text-4xl font-bold text-gray-800">Featured Products</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products?.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <Card className="flex h-[450px] flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      fill
                      src={product.imageUrl[0] || "/placeholder.svg"}
                      alt={product.title}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <Badge
                      variant="secondary"
                      className="absolute right-2 top-2 bg-white/80 text-primary backdrop-blur-sm"
                    >
                      ${product.isBestPrice}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col p-4">
                  <CardTitle className="mb-2 line-clamp-2 text-lg font-semibold">{product.title}</CardTitle>
                  <p
                    className="mb-4 flex-1 overflow-hidden text-ellipsis text-sm text-gray-600"
                    dangerouslySetInnerHTML={{ __html: product.description as string }}
                  />
                </CardContent>
                <CardFooter className="p-4">
                  <Button className="w-full" variant="default">
                    <ShoppingCart className="mr-2 size-4" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

