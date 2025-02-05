import React from 'react';
import Image from 'next/image';
import { ProfileForm } from "./profile-form";
import MyProfileSideBar from '@/components/public/profile/my-profile-sidebar';

function MyAccountBody() {
  
  return (
    <div>
      <div className='my-8 flex min-h-[80vh] w-full px-12'>
        <MyProfileSideBar />

        <div className='border-gray w-3/4 rounded-md border-2'>
          <div className='m-8 place-items-center'>
            <Image
              src="/img/profile-placeholder-img.png"
              alt="User Profile Image"
              width={150}
              height={150}
              className="mr-2"
            />
          </div>

          {/* form here */}
          <ProfileForm />


        </div>
      </div>
    </div>
  );
}

export default MyAccountBody;
[/*          <div className="w-full max-w-2xl px-4">
            
          </div> */];