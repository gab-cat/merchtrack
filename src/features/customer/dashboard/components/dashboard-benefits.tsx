'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BarChart3, Truck, Award, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 70
    }
  }
};

export default function AnimatedBenefits() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  const benefits = [
    {
      icon: <Truck className="size-6 text-primary" />,
      title: "Fast Delivery",
      description: "Quick shipping options available"
    },
    {
      icon: <Award className="size-6 text-primary" />,
      title: "Quality Guarantee",
      description: "Premium quality assurance"
    },
    {
      icon: <ShieldCheck className="size-6 text-primary" />,
      title: "Secure Payment",
      description: "Safe & secure transactions"
    },
    {
      icon: <BarChart3 className="size-6 text-primary" />,
      title: "Real-time Tracking",
      description: "Monitor your orders live"
    }
  ];

  return (
    <motion.div 
      ref={ref}
      variants={container}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      className="grid grid-cols-1 gap-6 py-8 md:grid-cols-2 lg:grid-cols-4"
    >
      {benefits.map((benefit, index) => (
        <motion.div key={index} variants={item}>
          <Card className="flex flex-col items-center rounded-lg border bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              {benefit.icon}
            </div>
            <h3 className="mb-2 text-lg font-semibold">{benefit.title}</h3>
            <p className="text-muted-foreground text-sm">{benefit.description}</p>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}