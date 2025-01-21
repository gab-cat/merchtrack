import React from 'react';
import { ABOUT_DEVELOPERS } from '@/constants';

function AboutUsBody() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">   
        <div className="overflow-hidden rounded-2xl bg-white transition-all">
          <div className="p-8 sm:p-12">
            <div className="mb-12">
              <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-800">
                <span className="mr-4 rounded-lg bg-blue-100 p-2 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
                    Our Mission
              </h2>
              <p className="text-base leading-relaxed text-gray-600">
                    We are dedicated to creating innovative solutions that empower businesses 
                    and individuals to achieve their goals. Through cutting-edge technology 
                    and exceptional service, we strive to make a positive impact in the world.
              </p>
            </div>
        
            <div className="mb-12">
              <h2 className="mb-8 flex items-center text-2xl font-bold text-gray-800">
                <span className="mr-4 rounded-lg bg-green-100 p-2 text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
                    Our Values
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800 group-hover:text-blue-700">Innovation</h3>
                  <p className="text-sm text-gray-600 group-hover:text-blue-600">Pushing boundaries and exploring new possibilities</p>
                </div>
                <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800 group-hover:text-green-700">Excellence</h3>
                  <p className="text-sm text-gray-600 group-hover:text-green-600">Delivering quality in everything we do</p>
                </div>
                <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800 group-hover:text-purple-700">Integrity</h3>
                  <p className="text-sm text-gray-600 group-hover:text-purple-600">Building trust through honest practices</p>
                </div>
              </div>
            </div>
        
            <div className="mb-12">
              <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-800">
                <span className="mr-4 rounded-lg bg-purple-100 p-2 text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
                    Our Team
              </h2>
              <p className="mb-8 text-base leading-relaxed text-gray-600">
                    Our diverse team of experts brings together years of experience in 
                    software development, design, and customer service. We&apos;re passionate 
                    about creating solutions that make a difference.
              </p>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-indigo-100">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800 group-hover:text-indigo-700">Experience</h3>
                  <p className="text-sm text-gray-600 group-hover:text-indigo-600">Over 10 years of industry expertise</p>
                </div>
                <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-pink-50 hover:to-pink-100">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800 group-hover:text-pink-700">Global Reach</h3>
                  <p className="text-sm text-gray-600 group-hover:text-pink-600">Serving clients worldwide</p>
                </div>
              </div>
            </div>
    
            <div>
              <h2 className="mb-8 flex items-center text-2xl font-bold text-gray-800">
                <span className="mr-4 rounded-lg bg-indigo-100 p-2 text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
                    Meet Our Developers
              </h2>
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                {ABOUT_DEVELOPERS.map((developer, index) => (
                  <div key={index} className="group text-center">
                    <div className="mb-4 overflow-hidden rounded-xl transition-all duration-300 group-hover:ring-4 group-hover:ring-indigo-200">
                      <img
                        src={`https://i.pravatar.cc/300?img=${index + 1}`} // Dynamic image source
                        alt={`Developer ${index + 1}`}
                        className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{developer.first_name}<br/>{developer.surname}</h3>
                    <p className="text-sm text-gray-600">{developer.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUsBody;
