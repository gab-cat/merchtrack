'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Category } from '@prisma/client';
import CategoryShowcase from '@/components/protected/category-showcase';

interface AnimatedCategoryShowcaseProps {
  categories: (Category & { 
    products: { 
      imageUrl: string[]; 
      title: string; 
      description: string; 
    }[] 
  })[];
  title?: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 12
    }
  }
};

export default function AnimatedCategoryShowcase({ 
  categories, 
  title = "Shop By Category" 
}: AnimatedCategoryShowcaseProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="w-full"
    >
      <CategoryShowcase 
        categories={categories}
        title={title}
        animationVariants={itemVariants}
      />
    </motion.div>
  );
}