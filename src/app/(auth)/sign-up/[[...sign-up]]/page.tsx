'use client';

import { SignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";

const Page = () => {
  return (
    <motion.div 
      className="flex min-h-[70vh] flex-col items-center justify-center py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <SignUp />
    </motion.div>
  );
};

export default Page;