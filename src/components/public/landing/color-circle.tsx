"use client";

import React from "react";
import { motion } from "framer-motion";

interface ColorCircleProps {
  delay: number;
}

const ColorCircle = React.memo(({ delay }: ColorCircleProps) => (
  <motion.circle
    suppressHydrationWarning
    r={Math.random() * 100 + 50}
    cx={Math.random() * 100 + "%"}
    cy={Math.random() * 100 + "%"}
    fill={`hsl(227, 40%, ${Math.random() * 50 + 50}%)`}
    initial={{ opacity: 0 }}
    animate={{
      opacity: [0.7, 0.3, 0.7],
      scale: [1, 1.2, 1],
      x: [0, Math.random() * 100 - 50, 0],
      y: [0, Math.random() * 100 - 50, 0],
    }}
    style={{ filter: 'blur(10px)' }}
    transition={{
      duration: 10,
      repeat: Number.POSITIVE_INFINITY,
      delay,
    }}
  />
));

ColorCircle.displayName = "ColorCircle";

export default ColorCircle;