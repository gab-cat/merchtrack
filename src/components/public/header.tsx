"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// Dynamically import the auth buttons with no SSR
const AuthButtons = dynamic(
  () => import("@/components/public/auth-buttons"),
  { ssr: false, loading: () => <div className="h-9 w-[180px] animate-pulse rounded bg-neutral-100" /> }
);

const HeaderLP = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();
  
  const headerBackground = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255,255,255,0)", "rgba(255,255,255,0.9)"]
  );

  const headerBorder = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255,255,255,0)", "rgba(0,0,0,0.1)"]
  );

  useEffect(() => {
    const updateScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", updateScroll);
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  return (
    <motion.header
      style={{
        backgroundColor: headerBackground,
        borderBottom: `1px solid`,
        borderColor: headerBorder,
        backdropFilter: "blur(8px)",
      }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full",
        isScrolled ? "py-4" : "py-6"
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <nav className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/img/logo.png"
                alt="MerchTrack Logo"
                width={32}
                height={32}
                className="size-8"
              />
              <span className="text-xl font-bold text-primary">MerchTrack</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <div className="mr-4 hidden items-center gap-6 sm:flex">
              {["Products", "About", "Contact", "FAQs"].map((item) => (
                <motion.div
                  key={item}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className={cn("text-sm font-semibold text-neutral-7 transition-colors hover:text-neutral-8",
                      pathname === `/${item.toLowerCase()}`
                        ? "text-primary"
                        : "text-neutral-7"
                    )}
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}
            </div>
            
            {/* Client-side only auth buttons */}
            <Suspense fallback={<div className="h-9 w-[180px] animate-pulse rounded bg-neutral-100" />}>
              <AuthButtons />
            </Suspense>
          </motion.div>
        </nav>
      </div>
    </motion.header>
  );
};

export default HeaderLP;
