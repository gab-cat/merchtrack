import React from 'react';
import Image from 'next/image';
import { Button } from './button';

const HeaderLP = () => {
  return (
    <nav className="flex items-center">
      <Image
        src="/assets/merch-track_4.png"
        width={83}
        height={83}
        alt="Logo"
      />
      <div className="text-4xl font-medium">
        MerchTrack
      </div>
      <div className="m-auto space-x-20">
        <a className="text-lg">About</a>
        <a className="text-lg">Contact</a>
        <a className="text-lg">FAQs</a>

      </div>

      <div className="ml-auto mr-8 space-x-4">
        {/* Placeholder Buttons */}
        <Button>Sign In</Button>
        <Button>Sign Out</Button>
      </div>
    </nav>

  );
};

export default HeaderLP;
