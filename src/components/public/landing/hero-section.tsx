"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShoppingCart, Star } from "lucide-react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";


const featuredProducts = [
  {
    name: "University Hoodie",
    description: "Stay cozy with our official university hoodie",
    price: 49.99,
    discount: "10% OFF",
    image: "/placeholder.svg?height=600&width=600&text=University+Hoodie",
  },
  {
    name: "Textbook Bundle",
    description: "Get all your required textbooks in one package",
    price: 299.99,
    discount: "15% OFF",
    image: "/placeholder.svg?height=600&width=600&text=Textbook+Bundle",
  },
  {
    name: "Laptop Package",
    description: "Special student discount on laptops",
    price: 799.99,
    discount: "20% OFF",
    image: "/placeholder.svg?height=600&width=600&text=Laptop+Package",
  },
  {
    name: "Dorm Essentials Kit",
    description: "Everything you need for your dorm room",
    price: 149.99,
    discount: "25% OFF",
    image: "/placeholder.svg?height=600&width=600&text=Dorm+Essentials+Kit",
  },
  {
    name: "Campus Bike",
    description: "Get around campus quickly and easily",
    price: 249.99,
    discount: "5% OFF",
    image: "/placeholder.svg?height=600&width=600&text=Campus+Bike",
  },
];

const ColorCircle = React.memo(({ delay }: { delay: number }) => (
  <motion.circle
    r={Math.random() * 100 + 50}
    cx={Math.random() * 100 + "%"}
    cy={Math.random() * 100 + "%"}
    fill={`hsl(227, 70%, ${Math.random() * 50 + 25}%)`}
    initial={{ opacity: 0 }}
    animate={{
      opacity: [0.7, 0.3, 0.7],
      scale: [1, 1.2, 1],
      x: [0, Math.random() * 100 - 50, 0],
      y: [0, Math.random() * 100 - 50, 0],
    }}
    transition={{
      duration: 10,
      repeat: Number.POSITIVE_INFINITY,
      delay,
    }}
  />
));

ColorCircle.displayName = "ColorCircle";

const HeroSection = () => {
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProductIndex((prevIndex) => (prevIndex === featuredProducts.length - 1 ? 0 : prevIndex + 1));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const currentProduct = useMemo(() => featuredProducts[currentProductIndex], [currentProductIndex]);

  const renderStars = useCallback(() => {
    return [...Array(5)].map(() => <Star key={nanoid()} className="size-5 fill-current text-yellow-400" />);
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Animated background with dispersed color circles */}
      <div className="absolute inset-0 z-0">
        <svg className="size-full" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f8f9fa" />
          <ColorCircle delay={0} />
          <ColorCircle delay={2} />
          <ColorCircle delay={4} />
          <ColorCircle delay={6} />
          <ColorCircle delay={8} />
        </svg>
      </div>

      {/* Frosted glass overlay */}
      <div className="absolute inset-0 z-10 backdrop-blur-xl"></div>

      <div className="container z-20 mx-auto px-4 py-12">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="rounded-xl bg-white/30 p-8 shadow-lg backdrop-blur-lg"
          >
            <Badge variant="secondary" className="mb-4">
              Campus Essentials
            </Badge>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-800 md:text-6xl">
              Your One-Stop Shop for <span className="text-primary">University Life</span>
            </h1>
            <p className="mb-8 text-xl text-gray-700 md:text-2xl">
              From textbooks to tech, find everything you need for a successful academic year.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="text-primary-foreground animate-pulse bg-primary hover:bg-primary/90">
                Shop Now <ArrowRight className="ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="hover:text-primary-foreground border-primary text-primary hover:bg-primary"
              >
                View Catalog <ShoppingCart className="ml-2" />
              </Button>
            </div>
            <div className="mt-8 flex items-center">
              <div className="flex">
                {renderStars()}
              </div>
              <span className="ml-2 text-sm text-gray-600">4.9 out of 5 stars from 1,000+ student reviews</span>
            </div>
          </motion.div>
          <div className="relative h-[600px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProductIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <div className="relative z-10 h-full">
                  <img
                    src={currentProduct.image || "/placeholder.svg"}
                    alt={currentProduct.name}
                    className="size-full rounded-lg object-cover shadow-2xl"
                    style={{ filter: "hue-rotate(-50deg) saturate(1.5)" }}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="absolute inset-x-4 bottom-4 rounded-lg bg-black/70 p-4 text-white backdrop-blur-md"
                  >
                    <h3 className="mb-2 text-lg font-semibold">{currentProduct.name}</h3>
                    <p className="mb-2 text-sm">{currentProduct.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        ${currentProduct.price.toFixed(2)}
                      </span>
                      <Badge variant="secondary" className="bg-white text-primary">
                        {currentProduct.discount}
                      </Badge>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(HeroSection);

