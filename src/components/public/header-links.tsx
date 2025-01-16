'use client';

import Link from "next/link";
import React from 'react';
import { HEADER_LINKS } from "@/constants";

const HeaderLinks = React.memo(({ pathname }: {pathname: string}) => {
  return HEADER_LINKS.map((link: LinkType) => {
    const isActive = pathname === link.href;
    return (
      <li key={link.href}>
        <Link
          href={link.href}
          className={`group relative block overflow-hidden rounded px-3 py-2 md:p-0 ${
            isActive 
              ? 'dark:text-primary-light font-bold text-primary' 
              : 'text-neutral-7 dark:text-neutral-1'
          }`}
        >
          <span className={`relative z-10 transition-colors duration-300 ${
            isActive 
              ? '' 
              : 'dark:group-hover:text-primary-light group-hover:text-primary'
          }`}>
            {link.displayName}
          </span>
          <span className={`absolute bottom-0 left-0 h-0.5 w-full origin-left bg-gradient-to-r from-blue-400 to-primary transition-transform duration-300${
            isActive 
              ? 'scale-x-100' 
              : 'scale-x-0 group-hover:scale-x-100'
          }`}></span>
        </Link>
      </li>
    );
  });
});

HeaderLinks.displayName = 'HeaderLinks';

export default HeaderLinks;