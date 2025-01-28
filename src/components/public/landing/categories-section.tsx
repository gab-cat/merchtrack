"use client";

import { motion } from "framer-motion";
import { Book, Laptop, ShirtIcon as TShirt, GraduationCap, Coffee } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  { name: "Textbooks", icon: Book },
  { name: "Electronics", icon: Laptop },
  { name: "Apparel", icon: TShirt },
  { name: "Academic Supplies", icon: GraduationCap },
  { name: "Campus Life", icon: Coffee },
];

export default function CategoriesSection() {
  return (
    <section className="bg-secondary/10 py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center text-3xl font-bold">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="transition-shadow duration-300 hover:shadow-lg">
                <CardContent className="flex flex-col items-center p-4">
                  <category.icon className="mb-4 size-12 text-primary" />
                  <h3 className="text-center text-lg font-semibold">{category.name}</h3>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

