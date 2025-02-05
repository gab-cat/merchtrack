'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";


function TrackOrderBody() {
  return (
    <div className='my-8 flex min-h-[80vh] w-full flex-col items-center justify-center'>
      <div className='flex w-3/5 flex-row items-center'>
        <p className='font-bold'>Track My Order: </p>
        <p className='m-2 w-1/5 rounded-md border-2 border-blue-500 bg-blue-500/50 p-4'>2201</p>
      </div>
      <div className='flex w-3/5 flex-col place-items-center rounded-md border-2 p-16'>
        <div className='flex w-full flex-row justify-between'>
          <div className='flex flex-col items-center justify-between'>
            <Image
              src="/img/data-pending-icon.png"
              alt="Data Pending Icon"
              width={50}
              height={50}
              className="mr-2"
            />
            <p>To Pay</p>
            <div className="mt-4 size-4 rounded-full bg-blue-500"></div>
          </div>
          <div className='flex flex-col items-center justify-between'>
            <Image
              src="/img/product-icon.png"
              alt="Product Icon"
              width={50}
              height={50}
              className="mr-2"
            />
            <p>Processing</p>
            <div className="mt-4 size-4 rounded-full bg-gray-200"></div>
          </div>
          <div className='flex flex-col items-center justify-between'>
            <Image
              src="/img/purchased-icon.png"
              alt="Purchased Icon"
              width={50}
              height={50}
              className="mr-2"
            />
            <p>Finished</p>
            <div className="mt-4 size-4 rounded-full bg-gray-200"></div>
          </div>
          <div className='flex flex-col items-center justify-between'>
            <Image
              src="/img/truck-icon.png"
              alt="Truck Icon"
              width={50}
              height={50}
              className="mr-2"
            />
            <p>Distribution</p>
            <div className="mt-4 size-4 rounded-full bg-gray-200"></div>
          </div>
          <div className='flex flex-col items-center justify-between'>
            <Image
              src="/img/check-inbox-icon.png"
              alt="Check Inbox Icon"
              width={50}
              height={50}
              className="mr-2"
            />
            <p>Completed</p>
            <div className="mt-4 size-4 rounded-full bg-gray-200"></div>
          </div>
        </div>

        {/*<div>Milestones</div>*/}

        <p className='m-4'>Your order is currently pending. Order will be confirmed once you pay the initial or full payment.</p>
        
        <div>
          <Button className='m-4 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white' variant='outline'>View Order</Button>
          <Button className='m-4 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white' variant='outline'>Pay Order</Button>
        </div>
      </div>
    </div>
  );
}

export default TrackOrderBody;