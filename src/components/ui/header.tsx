'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SignInButton, SignUpButton } from '@clerk/nextjs';

type Links = {
  href: string
  displayName: string
}

const HeaderLP = () => {
  const [showNav, setShowNav] = useState(false);
  const handleNavPress = () => {
    setShowNav(!showNav);
  };
  const links: Links[] = [
    {
      href: '/about',
      displayName: "About"
    },
    {
      href: '/contact',
      displayName: 'Contacts'
    },
    {
      href: '/faqs',
      displayName: 'FAQs'
    }
  ];
  return (
    <nav className='border-b'>
      <div className="max-w-screen-lg flex flex-row flex-wrap mx-auto items-center justify-between py-4 p-2">
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <Image
            src="/img/merch-track-logo.png"
            width={40}
            height={40}
            alt="MerchTrack Logo"
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-neutral-8 dark:text-neutral-1">MerchTrack</span>
        </Link>
        <div className="flex md:order-2 space-x-3">
          <SignInButton mode='modal'>
            <button type='button' className="text-primary bg-neutral-1  focus:ring-4 focus:outline-none focus:ring-accent-7 font-medium rounded-lg text-sm px-4 py-2 text-center hidden md:flex w-max outline outline-1 outline-primary hover:opacity-70">Sign In</button>
          </SignInButton>
          <SignUpButton mode='modal'>
            <button type="button" className="text-neutral-1 bg-primary hover:opacity-90 focus:ring-4 focus:outline-none focus:ring-accent-7 font-medium rounded-lg text-sm px-4 py-2 text-center hidden md:flex">Sign Up</button>
          </SignUpButton>
          <button data-collapse-toggle="navbar-cta" onClick={handleNavPress} type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 border" aria-controls="navbar-cta" aria-expanded={showNav} aria-label='Toggle navigation menu'>
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button>
        </div>
        <div className={`${showNav ? 'flex' : 'hidden'} items-center justify-between w-full md:flex md:w-auto md:order-1`} id="navbar-cta">
          <ul className="flex flex-col w-full text-center font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-transparent">
            <li className="md:hidden">
              <SignInButton mode="modal">
                <button className="text-primary bg-neutral-1 focus:ring-4 focus:outline-none focus:ring-accent-7 font-medium rounded-lg text-sm px-4 py-2 text-center outline outline-1 outline-primary hover:opacity-70 my-1 w-1/2">
                  Sign In
                </button>
              </SignInButton>
            </li>
            <li className="md:hidden">
              <SignUpButton mode="modal">
                <button className="text-neutral-1 bg-primary focus:ring-4 focus:outline-none focus:ring-accent-7 font-medium rounded-lg text-sm px-4 py-2 text-center w-1/2 hover:opacity-90">
                  Sign Up
                </button>
              </SignUpButton>
            </li>
            <hr className='m-2 ' />
            {links.map((link: Links) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block py-2 px-3 md:p-0 text-neutral-8 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700"
                >
                  {link.displayName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default HeaderLP;
