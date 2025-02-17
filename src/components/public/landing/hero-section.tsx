"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import BackgroundAnimation from "./background-animation";
import { Button } from "@/components/ui/button";


const HeroSection = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <BackgroundAnimation />

      <motion.section
        initial="hidden"
        animate="visible"
        className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20"
      >
        {/* Content */}
        <motion.div
          style={{ y }}
          className="relative z-10 w-full"
        >
          <div className="flex flex-col items-center gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                x: mousePosition.x,
                y: mousePosition.y,
              }}
            >
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                <motion.span
                  className="inline-block bg-gradient-to-r from-primary to-primary bg-clip-text leading-normal text-transparent"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ backgroundSize: "200% auto" }}
                >
                  Your University Merch
                </motion.span>
                <br />
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="inline-block"
                >
                  All in One Place
                </motion.span>
              </h1>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-muted-foreground max-w-2xl text-lg sm:text-xl"
            >
              Discover, customize, and order your university merchandise with ease.
              Express your school spirit with our curated collection.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-4 flex flex-col gap-4 sm:flex-row"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="group relative overflow-hidden text-neutral-2">
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <span className="relative">Start Shopping</span>
                  <ArrowRight className="relative ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="backdrop-blur-sm">
                  Learn More
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Gradient */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,rgba(var(--primary-rgb),0.15),transparent)]"
        />
      </motion.section>
    </>
  );
};

export default React.memo(HeroSection);

