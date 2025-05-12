'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import HeroSection from '@/components/protected/hero-section';

const heroVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export default function AnimatedHeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  return (
    <motion.div
      ref={ref}
      variants={heroVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="w-full"
    >
      <HeroSection />
    </motion.div>
  );
}