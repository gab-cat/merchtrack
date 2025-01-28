"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const merchItems = [
  { name: "University Hoodie", price: 49.99, image: "/placeholder.svg?height=300&width=300&text=University+Hoodie" },
  { name: "Campus Mug", price: 14.99, image: "/placeholder.svg?height=300&width=300&text=Campus+Mug" },
  { name: "Branded Backpack", price: 59.99, image: "/placeholder.svg?height=300&width=300&text=Branded+Backpack" },
  { name: "Alumni T-Shirt", price: 24.99, image: "/placeholder.svg?height=300&width=300&text=Alumni+T-Shirt" },
];

export default function UniversityMerchSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center text-3xl font-bold">University Merchandise</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {merchItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="mb-4 h-48 w-full rounded-md object-cover"
                  />
                  <h3 className="mb-2 text-lg font-semibold">{item.name}</h3>
                  <Badge variant="secondary">${item.price.toFixed(2)}</Badge>
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

