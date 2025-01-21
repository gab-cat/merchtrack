import React from 'react';
import { FOOTER_DETAILS } from '@/constants';

function TermsOfServiceBody() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">   
        <div className="overflow-hidden rounded-2xl bg-white transition-all">
          <div className="p-8 sm:p-12">
            <div className="mb-12">
              <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-800">
                <span className="mr-4 rounded-lg bg-blue-100 p-2 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                Terms of Service
              </h2>
              <p className="mb-4 text-base leading-relaxed text-gray-600">
                Last updated: January 1, 2024
              </p>
              <p className="text-base leading-relaxed text-gray-600">
                Please read these Terms of Service carefully before using our services. 
                These terms govern your use of our platform and services.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="mb-8 flex items-center text-2xl font-bold text-gray-800">
                <span className="mr-4 rounded-lg bg-green-100 p-2 text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                </span>
                Account Terms
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800 group-hover:text-blue-700">Account Creation</h3>
                  <p className="text-sm text-gray-600 group-hover:text-blue-600">You must be at least 18 years old and provide accurate information during registration.</p>
                </div>
                <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800 group-hover:text-green-700">Account Security</h3>
                  <p className="text-sm text-gray-600 group-hover:text-green-600">You are responsible for maintaining the security of your account credentials.</p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="mb-8 flex items-center text-2xl font-bold text-gray-800">
                <span className="mr-4 rounded-lg bg-purple-100 p-2 text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                Service Usage
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-indigo-100">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800 group-hover:text-indigo-700">Fair Use</h3>
                  <p className="text-sm text-gray-600 group-hover:text-indigo-600">Use services responsibly and within reasonable limits</p>
                </div>
                <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-pink-50 hover:to-pink-100">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800 group-hover:text-pink-700">Prohibited Actions</h3>
                  <p className="text-sm text-gray-600 group-hover:text-pink-600">No illegal or unauthorized use of services</p>
                </div>
                <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-yellow-50 hover:to-yellow-100">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800 group-hover:text-yellow-700">Content Rules</h3>
                  <p className="text-sm text-gray-600 group-hover:text-yellow-600">Respect intellectual property and community guidelines</p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="mb-8 flex items-center text-2xl font-bold text-gray-800">
                <span className="mr-4 rounded-lg bg-red-100 p-2 text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </span>
                Liability & Disclaimers
              </h2>
              <p className="mb-8 text-base leading-relaxed text-gray-600">
                Our service limitations and disclaimers regarding service availability, warranties, and liability:
              </p>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-red-50 hover:to-red-100">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800 group-hover:text-red-700">Service Availability</h3>
                  <p className="text-sm text-gray-600 group-hover:text-red-600">We strive for 99.9% uptime but cannot guarantee uninterrupted service</p>
                </div>
                <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800 group-hover:text-orange-700">Warranty Disclaimer</h3>
                  <p className="text-sm text-gray-600 group-hover:text-orange-600">Services provided &quot;as is&quot; without warranties of any kind</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-8 flex items-center text-2xl font-bold text-gray-800">
                <span className="mr-4 rounded-lg bg-indigo-100 p-2 text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                Contact Information
              </h2>
              <p className="mb-4 text-base leading-relaxed text-gray-600">
                For questions about these Terms of Service, please contact us at:
              </p>
              <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <p className="text-base text-gray-800">
                  {FOOTER_DETAILS.email}<br />
                  {FOOTER_DETAILS.phone}<br />
                  {FOOTER_DETAILS.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsOfServiceBody;