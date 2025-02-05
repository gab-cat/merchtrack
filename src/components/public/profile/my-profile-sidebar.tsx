'use client';

import React from 'react';
import Image from 'next/image';
import { useUser, useClerk } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";

function MyProfileSideBar() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Name";
  const email = user && user.primaryEmailAddress ? user.primaryEmailAddress.emailAddress : "email@gmail.com";

  const handleLogout = () => {
    signOut();
  };
  
  return (
    <div className='flex w-1/4 flex-col place-items-center justify-between'>
      <div className='my-4 flex flex-col place-items-start'>
        <Image
          src="/img/profile-placeholder-img.png"
          alt="User Profile Image"
          width={150}
          height={150}
          className="my-4 mr-2 place-self-center"
        />
        <p className='font-bold'>{fullName}</p>
        <p className='text-xs'>{email}</p>
      </div>

      <div className='flex flex-col'>
        <Button className='border-black-500 my-4 h-16 w-48 hover:border-blue-500 hover:bg-blue-500/50 hover:text-white' color="blue" variant="outline">
          <Image
            src="/img/my-orders-icon.png"
            alt="My Orders Icon"
            width={20}
            height={20}
            className="mr-2"
          />
          My Orders
        </Button>

        <Button className='border-black-500 my-4 h-16 w-48 hover:border-blue-500 hover:bg-blue-500/50 hover:text-white' color="blue" variant="outline">
          <Image
            src="/img/my-account-icon.png"
            alt="My Account Icon"
            width={20}
            height={20}
            className="mr-2"
          />
          My Account
        </Button>
      </div>

      <Button 
        className='mb-8 size-fit hover:bg-blue-500/50 hover:text-white' 
        color="blue" 
        variant="outline"
        onClick={handleLogout}
      >
        <Image
          src="/img/logout-icon.png"
          alt="Logout Icon"
          width={20}
          height={20}
          className="mr-2"
        />
        Logout
      </Button>
    </div>
  );
}

export default MyProfileSideBar;