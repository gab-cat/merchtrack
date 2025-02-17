"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const products = [
  {
    id: 1,
    name: "Classic University Hoodie",
    price: 49.99,
    image: "/img/placeholder.jpg",
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Campus Backpack",
    price: 39.99,
    image: "/img/placeholder.jpg",
    badge: "New Arrival",
  },
  {
    id: 3,
    name: "Vintage College Tee",
    price: 24.99,
    image: "/img/placeholder.jpg",
    badge: "Popular",
  },
  {
    id: 4,
    name: "Student Essentials Bundle",
    price: 79.99,
    image: "/img/placeholder.jpg",
    badge: "Limited Edition",
  },
];

const FeaturedProducts = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={containerRef} className="w-full overflow-hidden py-24">
      <motion.div
        style={{ y }}
        className="w-full"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary">
            Featured Products
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Check out our most popular university merchandise
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group overflow-hidden">
                <CardHeader className="p-0">
                  <div className="relative aspect-square">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute left-2 top-2">
                      <Badge className="font-medium text-neutral-2">
                        {product.badge}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <h3 className="truncate font-semibold">{product.name}</h3>
                  <p className="text-muted-foreground">
                    ${product.price.toFixed(2)}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    className="group w-full text-neutral-2"
                  >
                    Add to Cart
                    <ShoppingCart className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex justify-center"
        >
          <Button size="lg" variant="outline" className="group">
            View All Products
            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default FeaturedProducts;

