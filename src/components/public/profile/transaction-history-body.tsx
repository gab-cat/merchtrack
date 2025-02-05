import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import MyProfileSideBar from '@/components/public/profile/my-profile-sidebar';
import { ORDERS_CONTENT } from "@/constants";

function TansactionHistoryBody() {
  return (
    <div>
      <div className='my-8 flex max-h-[80vh] w-full px-12'>
        <MyProfileSideBar />

        <div className='border-gray w-3/4 rounded-md border-2'>
          <div className='m-8'>
            <Button className='text-black' variant="link">
              <Link href="/my-orders">
                My Orders
              </Link>
            </Button>
            <Button className='font-bold text-black' variant="link">
              <Link href="/transaction-history">
                Transaction History
              </Link>
            </Button>
          </div>

          {/* Scrollable Orders Section */}
          <div className='h-4/5 overflow-y-auto'>
            {ORDERS_CONTENT.map((order, index) => (
              <div key={index} className='mb-8 flex h-[120] w-[90%] flex-row place-self-center border-2'>
                <div className='m-2'>
                  <Image
                    src="/img/profile-placeholder-img.png"
                    alt="My Account Icon"
                    width={125}
                    height={125}
                  />
                </div>

                <div className='flex w-full flex-row justify-between px-4'>
                  <div className='flex flex-col justify-around'>
                    <p className='text-2xl'>Order ID: {order.order_id}</p>
                    <p className='text-orange-500'>Total ${order.order_amount}</p>
                  </div>
                  <div className='flex place-items-center gap-x-4'>
                    <Button>
                      <Link href="/pay-order">
                        Pay Order
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default TansactionHistoryBody;