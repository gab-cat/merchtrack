'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import FeaturedProducts from '@/components/protected/featured-products';
import { ExtendedProduct } from '@/types/extended';

interface AnimatedProductSectionProps {
  title: string;
  products: ExtendedProduct[];
  viewAllLink?: string;
}

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 60
    }
  }
};

export default function AnimatedProductSection({ 
  title, 
  products, 
  viewAllLink = "/products" 
}: AnimatedProductSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const router = useRouter();

  if (products.length === 0) return null;

  return (
    <motion.div
      ref={ref}
      variants={sectionVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="mt-16"
    >
      <motion.div 
        variants={headerVariants} 
        className="mb-8 flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold">{title}</h2>
        <Button 
          variant="outline" 
          className="gap-2 transition-all duration-300 hover:bg-primary hover:text-white"
          onClick={() => router.push(viewAllLink)}
        >
          View All <ArrowRight className="size-4" />
        </Button>
      </motion.div>
      
      <FeaturedProducts 
        products={products} 
        animate={true}
      />
    </motion.div>
  );
}