"use client";

import React from "react";
import Image from "next/image";

export const Avatar = () => (
  <div
    className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full"
  >
    <Image
      src="/sample_pfp.png"
      alt="User Avatar"
      width={40}
      height={40}
      className="aspect-square h-full w-full"
    />
  </div>
);


