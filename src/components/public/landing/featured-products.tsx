"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const products = [
  { id: 1, name: "Smart Watch", price: 199.99, image: "/placeholder.svg?height=300&width=300" },
  { id: 2, name: "Wireless Earbuds", price: 149.99, image: "/placeholder.svg?height=300&width=300" },
  { id: 3, name: "Portable Charger", price: 49.99, image: "/placeholder.svg?height=300&width=300" },
];

export default function FeaturedProducts() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center text-3xl font-bold">Featured Products</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <Badge variant="secondary">${product.price}</Badge>
                </CardHeader>
                <CardContent>
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="h-48 w-full rounded-md object-cover"
                  />
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Add to Cart</Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

