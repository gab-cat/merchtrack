'use client';

import Link from "next/link";
import { HEADER_LINKS } from "@/constants";
import { cn } from "@/lib/utils"; 


const HeaderLinks = ({pathname}: {pathname: string}) => {
  return HEADER_LINKS.map((link: LinkType) => {
    const isActive = pathname === link.href;
    return (
      <li key={link.href}>
        <Link
          href={link.href}
          className={cn(
            "block py-2 px-3 md:p-0 rounded relative overflow-hidden group",
            isActive 
              ? 'text-primary dark:text-primary-light font-bold' 
              : 'text-neutral-7 dark:text-neutral-1'
          )}
        >
          <span className={cn(
            "relative z-10 transition-colors duration-300",
            isActive 
              ? '' 
              : 'group-hover:text-primary dark:group-hover:text-primary-light'
          )}>
            {link.displayName}
          </span>
          <span className={cn(
            "absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-primary transform transition-transform duration-300 origin-left",
            isActive 
              ? 'scale-x-100' 
              : 'scale-x-0 group-hover:scale-x-100'
          )} />
        </Link>
      </li>
    );
  });
};

export default HeaderLinks;