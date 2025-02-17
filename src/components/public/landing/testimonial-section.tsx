"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    id: 1,
    name: "Alex Thompson",
    role: "Student",
    content: "The quality of merchandise is outstanding. Fast delivery and great customer service!",
    rating: 5,
    image: "/img/sample_pfp.jpg"
  },
  {
    id: 2,
    name: "Sarah Chen",
    role: "Graduate Student",
    content: "Love the variety of products available. The customization options are amazing!",
    rating: 5,
    image: "/img/sample_pfp.jpg"
  },
  {
    id: 3,
    name: "Michael Lee",
    role: "Alumni",
    content: "Great platform to stay connected with my university. The merch quality is top-notch!",
    rating: 5,
    image: "/img/sample_pfp.jpg"
  }
];

const TestimonialSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      className="w-full py-24"
    >
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Read about experiences from our satisfied customers
          </p>
        </motion.div>

        <div className="relative h-[400px] overflow-hidden">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={activeIndex}
              custom={activeIndex}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute w-full"
            >
              <Card className="border bg-neutral-1 shadow-md">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center gap-6 text-center">
                    <div className="relative size-20 overflow-hidden rounded-full">
                      <Image
                        width={100}
                        height={100}
                        src={testimonials[activeIndex].image}
                        alt={testimonials[activeIndex].name}
                        className="mx-auto object-cover"
                      />
                    </div>
                    <div className="flex gap-1">
                      {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                        <Star key={i} className="size-5 fill-primary text-primary" />
                      ))}
                    </div>
                    <blockquote className="text-xl italic">
                    &ldquo;{testimonials[activeIndex].content}&rdquo;
                    </blockquote>
                    <div>
                      <p className="font-semibold">{testimonials[activeIndex].name}</p>
                      <p className="text-muted-foreground text-sm">{testimonials[activeIndex].role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`size-2 rounded-full transition-colors ${
                index === activeIndex ? "bg-primary" : "bg-primary/20"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default TestimonialSection;

