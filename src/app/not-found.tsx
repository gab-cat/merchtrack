'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ArrowLeft, Home, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import HeaderLP from '@/components/public/header';
import Footer from '@/components/public/footer';

const particles = Array.from({ length: 30 }, () => ({
  size: Math.random() * 6 + 2,
  initialX: Math.random() * 100,
  initialY: Math.random() * 100,
}));

export default function NotFound() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoBack = () => {
    setIsNavigating(true);
    setTimeout(() => {
      if (window.history.length <= 2) {
        router.push('/');
      } else {
        router.back();
      }
    }, 100);
  };

  if (!mounted) return null;

  return (
    <>
      <HeaderLP />
      <div className="from-primary-50 relative flex min-h-[75vh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b to-white px-4 py-20">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary/20"
              style={{ 
                width: particle.size, 
                height: particle.size,
                left: `${particle.initialX}%`,
                top: `${particle.initialY}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          {/* Main content */}
          <div className="relative mb-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 flex justify-center"
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/20 blur-2xl"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <AlertCircle className="relative size-20 text-primary" />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-0.5 bg-primary/20 opacity-50 blur-xl" />
              <h1 className="relative text-[8rem] font-light tracking-tighter text-primary sm:text-[12rem]">
                404
              </h1>
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 text-xl font-light text-gray-600 sm:text-2xl"
            >
              The page you&apos;re looking for isn&apos;t here.
            </motion.h2>
          </div>

          {/* Action buttons */}
          <motion.div 
            className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoBack}
              disabled={isNavigating}
              className="group inline-flex items-center gap-2 rounded-full border-2 border-primary/20 bg-white px-6 py-2.5 text-sm font-medium text-primary transition-all hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className={cn("size-4", { "animate-pulse": isNavigating })} />
              {isNavigating ? "Navigating..." : "Go Back"}
            </motion.button>

            <Link
              href="/"
              className="group relative inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary/90"
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-primary"
                initial={false}
                whileHover={{
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              />
              <Home className="relative z-10 size-4" />
              <span className="relative z-10">Return Home</span>
            </Link>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <motion.div
          className="absolute bottom-20 left-1/2 h-px w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.1),transparent)]" />
      </div>
      <Footer />
    </>
  );
}

