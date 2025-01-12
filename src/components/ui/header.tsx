import React from 'react';
import Image from 'next/image';
import { Button } from './button';

const HeaderLP = () => {
  return (
    <nav className="flex flex-col md:flex-row items-center gap-4 md:gap-0 p-4 md:p-6">
      <Image
        src="/assets/merch-track_4.png"
        width={83}
        height={83}
        alt="MerchTrack Logo"
        className="w-[83px] h-auto"
      />
      <div className="text-4xl font-medium">
        MerchTrack
      </div>
      <div className="m-auto hidden md:block md:space-x-20">
        <a href="/about" className="text-lg hover:text-gray-600 transition-colors">About</a>  
        <a href="/contact" className="text-lg hover:text-gray-600 transition-colors">Contact</a>  
        <a href="/faqs" className="text-lg hover:text-gray-600 transition-colors">FAQs</a>
      </div>

      <div className="ml-auto mr-8 space-x-4">  
        {/* Placeholder Buttons */}  
        <Button>Sign Out</Button>
        <Button>Sign In</Button>
      </div>
    </nav>

  );
};

export default HeaderLP;
