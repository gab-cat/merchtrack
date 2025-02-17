"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const UniversityMerchSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="w-full py-24"
    >
      <div className="w-full">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <motion.div variants={itemVariants} className="relative aspect-square">
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <Image
                src="/img/merch-track-logo.png"
                alt="University Merchandise"
                fill
                className="object-cover"
              />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/20 to-transparent"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col gap-6">
            <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Personalize Your
              <br />
              University Experience
            </h2>
            <p className="text-muted-foreground text-lg">
              Express your school pride with our exclusive collection of customizable university merchandise. From classic hoodies to unique accessories, find everything you need to show your spirit.
            </p>
            <ul className="space-y-4">
              {[
                "Premium quality materials",
                "Custom designs for every school",
                "Fast and reliable shipping",
                "Student-friendly prices"
              ].map((feature, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="flex items-center gap-3"
                >
                  <div className="size-2 rounded-full bg-primary" />
                  {feature}
                </motion.li>
              ))}
            </ul>
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button size="lg" className="text-neutral-2">
                Explore Collection
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default UniversityMerchSection;

