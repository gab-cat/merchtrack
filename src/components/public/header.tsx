'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import HeaderLinks from './header-links';

const HeaderLP = React.memo(() => {
  const pathname = usePathname();
  const [showNav, setShowNav] = useState(false);
  const handleNavPress = useCallback(() => {
    setShowNav((prevShowNav) => !prevShowNav);
  }, []);

  return (
    <nav className='border-b'>
      <div className="mx-auto flex max-w-screen-lg flex-row flex-wrap items-center justify-between p-2 py-4">
        <Link href="/" className="group flex items-center space-x-3 rtl:space-x-reverse">
          <div className="relative">
            <Image
              src="/img/merch-track-logo.png"
              width={40}
              height={40}
              alt="MerchTrack Logo"
              className="transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-primary-400 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-75 group-active:opacity-100"></div>
          </div>
          <span className="relative self-center whitespace-nowrap text-2xl font-bold tracking-tighter text-neutral-7 transition-colors duration-300 group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-primary-400 group-hover:bg-clip-text group-hover:text-transparent group-active:from-blue-600 group-active:to-primary-600 dark:text-neutral-1">
            MerchTrack<span className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-gradient-to-r from-blue-400 to-primary-400 transition-transform duration-300 group-hover:scale-x-100 group-active:scale-x-100 group-active:from-blue-600 group-active:to-primary-600"></span>
          </span>
        </Link>
        <div className="flex space-x-3 md:order-2">
          <SignInButton mode='modal'>
            <button type='button' className="focus:ring-accent-7 hidden  w-max rounded-lg bg-neutral-1 px-4 py-2 text-center text-sm font-medium text-primary outline outline-1 outline-primary hover:opacity-70 focus:outline-none focus:ring-4 md:flex">Sign In</button>
          </SignInButton>
          <SignUpButton mode='modal'>
            <button type="button" className="focus:ring-accent-7 hidden rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-neutral-1 hover:opacity-90 focus:outline-none focus:ring-4 md:flex">Sign Up</button>
          </SignUpButton>
          <button data-collapse-toggle="navbar-cta" onClick={handleNavPress} type="button" className="inline-flex size-10 items-center justify-center rounded-lg border p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 md:hidden" aria-controls="navbar-cta" aria-expanded={showNav} aria-label='Toggle navigation menu'>
            <span className="sr-only">Open main menu</span>
            <svg className="size-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button>
        </div>
        <div className={`${showNav ? 'flex' : 'hidden'} w-full items-center justify-between md:order-1 md:flex md:w-auto`} id="navbar-cta">
          <ul className="mt-4 flex w-full flex-col rounded-lg border border-gray-100 bg-gray-50 p-4 text-center font-medium md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-transparent md:p-0">
            <li className="md:hidden">
              <SignInButton mode="modal">
                <button className="focus:ring-accent-7 my-1 w-1/2 rounded-lg bg-neutral-1 px-4 py-2 text-center text-sm font-medium text-primary outline outline-1 outline-primary hover:opacity-70 focus:outline-none focus:ring-4">
                  Sign In
                </button>
              </SignInButton>
            </li>
            <li className="md:hidden">
              <SignUpButton mode="modal">
                <button className="focus:ring-accent-7 w-1/2 rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-neutral-1 hover:opacity-90 focus:outline-none focus:ring-4">
                  Sign Up
                </button>
              </SignUpButton>
            </li>
            <hr className='m-2 ' />
            <HeaderLinks pathname={pathname}/>
          </ul>
        </div>
      </div>
    </nav>
  );
});
HeaderLP.displayName = 'HeaderLP';
export default HeaderLP;
