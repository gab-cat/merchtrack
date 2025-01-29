"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CallToAction() {
  return (
    <section 
      className="text-primary-foreground  py-16"
      aria-label="Newsletter subscription"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="mb-4 text-3xl font-bold" id="newsletter-heading">Stay Updated</h2>
          <p className="mb-8 text-xl">Subscribe to our newsletter for exclusive deals and updates</p>
          <form 
            className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row"
            aria-labelledby="newsletter-heading"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-primary-foreground grow text-primary"
            />
            <Button variant="secondary">Subscribe</Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

