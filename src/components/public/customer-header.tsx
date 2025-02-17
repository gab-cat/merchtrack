'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import { FaShoppingCart } from 'react-icons/fa';

const HeaderCustomer = React.memo(() => {
  const { isSignedIn } = useUser();

  return (
    <nav className='border-b'>
      <div className="mx-auto flex max-w-screen-lg flex-row items-center justify-between p-2 py-4">
        {/* Logo */}
        <Link href="/" className="group flex items-center space-x-3">
          <div className="relative">
            <Image
              src="/img/merch-track-logo.png"
              width={40}
              height={40}
              alt="MerchTrack Logo"
              className="transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-primary-400 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-75"></div>
          </div>
          <span className="text-2xl font-bold tracking-tighter text-neutral-7 dark:text-neutral-1">
            MerchTrack
          </span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <>
              {/* Cart Icon */}
              <Link href="/cart" className="text-primary hover:text-primary-600">
                <FaShoppingCart className="text-2xl" />
              </Link>

              {/* Profile Icon */}
              <UserButton afterSignOutUrl="/" />
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
});

HeaderCustomer.displayName = 'HeaderCustomer';
export default HeaderCustomer;