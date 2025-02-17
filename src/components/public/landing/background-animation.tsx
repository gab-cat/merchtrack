"use client";

import React from "react";
import ColorCircle from "./color-circle";

const BackgroundAnimation = () => {
  return (
    <div className="fixed inset-0 -z-10 h-screen w-screen">
      <svg className="size-full">
        {[...Array(5)].map((_, i) => (
          <ColorCircle key={`background-circle-${i}`} delay={i * 2} />
        ))}
      </svg>
      <div className="bg-grid-white/10 bg-grid-16 absolute inset-0 [mask-image:radial-gradient(white,transparent_85%)]" />
    </div>
  );
};

export default BackgroundAnimation;