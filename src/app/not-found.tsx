'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import HeaderLP from '@/components/public/header';
import Footer from '@/components/public/footer';

export default function NotFound() {
  return (
    <>
      <HeaderLP />
      <div className="flex min-h-[75vh] flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-primary-100 px-4">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-9xl font-bold text-blue-600"
        >
        404
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-4 text-2xl font-semibold text-gray-800"
        >
        Oops! Page Not Found
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8 text-center text-gray-600"
        >
        It seems you&apos;ve ventured into uncharted territory. Let&apos;s get you back on track!
        </motion.p>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          className="mb-8"
        >
          <svg
            className="size-64"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#3B82F6"
              d="M39.5,-65.3C50.2,-55.3,57.1,-42.4,62.6,-28.8C68.1,-15.2,72.3,-0.9,71.8,13.5C71.2,27.8,66,42.3,56.3,53.2C46.6,64.1,32.4,71.4,17.8,73.5C3.2,75.5,-11.8,72.3,-24.8,66.3C-37.8,60.3,-48.8,51.5,-57.3,40.5C-65.8,29.5,-71.8,16.3,-73.7,2.2C-75.5,-12,-73.2,-27,-65.3,-38C-57.4,-49,-43.9,-56,-30.8,-64.8C-17.7,-73.5,-4.9,-84,6.8,-94.3C18.5,-104.6,37,-105.7,39.5,-65.3Z"
              transform="translate(100 100)"
            />
          </svg>
          <svg
            className="absolute left-1/2 top-1/2 size-32 -translate-x-1/2 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="white"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/"
            className="rounded-full bg-blue-500 px-4 py-2 font-bold text-white transition duration-300 ease-in-out hover:-translate-y-1 hover:bg-blue-600 hover:shadow-lg"
          >
          Back to Home
          </Link>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}

