"use client";

import * as Sentry from "@sentry/nextjs";
import { useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, MailPlus, ArrowRight } from 'lucide-react';


export default function GlobalError({ error }: Readonly<{ error: Error & { digest?: string } }>) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // no-dd-sa:typescript-best-practices/no-console
      console.error('Global error caught:', error);
    }
    Sentry.captureException(error);
  }, [error]);

  const handleReport = useCallback(() => {
    Sentry.showReportDialog();
  }, []);

  return (
    <html lang="en">
      <body>
        <div className="from-primary-50 relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b to-white">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(44,89,219,0.1),transparent)]" />
          
          {/* Animated particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary/20"
              style={{
                width: Math.random() * 6 + 2,
                height: Math.random() * 6 + 2,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 w-full max-w-md"
          >
            <div className="overflow-hidden rounded-2xl bg-white/90 p-8 shadow-xl backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6 flex justify-center"
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/20 blur-lg"
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <div className="relative flex size-20 items-center justify-center rounded-full bg-primary/10">
                    <AlertTriangle className="size-10 text-primary" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="mb-2 text-center text-2xl font-bold text-primary">Oops! Something went wrong</h1>
                <p className="mb-6 text-center text-neutral-6">
                  We apologize for the inconvenience. Our team has been notified and is working to fix the issue.
                </p>
              </motion.div>

              <motion.div 
                className="space-y-4"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button
                  onClick={handleReport}
                  whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(44,89,219,0.25)" }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-white transition-all hover:bg-primary-600"
                >
                  <span>Report This Issue</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </motion.button>

                <motion.a
                  href="/contact"
                  whileHover={{ y: -2 }}
                  className="flex items-center justify-center gap-2 rounded-lg border border-primary/20 bg-white py-3 text-center font-medium text-primary transition-all hover:border-primary/50 hover:bg-primary-100/50"
                >
                  <MailPlus className="size-4" />
                  <span>Contact Support</span>
                </motion.a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </body>
    </html>
  );
}
