"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  {
    name: "Apparel",
    description: "Hoodies, T-shirts, and more",
    image: "/img/placeholder.jpg",
    href: "/categories/apparel",
  },
  {
    name: "Accessories",
    description: "Bags, caps, and accessories",
    image: "/img/placeholder.jpg",
    href: "/categories/accessories",
  },
  {
    name: "Supplies",
    description: "Notebooks, pens, and supplies",
    image: "/img/placeholder.jpg",
    href: "/categories/supplies",
  },
];

const CategoriesSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="bg-muted/50 w-full py-24"
    >
      <div className="w-full">
        <motion.div 
          variants={cardVariants}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary">
            Browse by Category
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Explore our wide range of university merchandise categories
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <motion.div
              key={category.name}
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href={category.href}>
                <Card className="hover:bg-muted h-full overflow-hidden transition-colors">
                  <CardContent className="p-6">
                    <div className="relative mb-4 aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">{category.name}</h3>
                    <p className="text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default CategoriesSection;

