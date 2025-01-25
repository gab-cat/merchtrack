import React from 'react';
import { Mail, Phone, MapPin } from "lucide-react";
import { FOOTER_DETAILS } from '@/constants';

function PrivacyPolicyBody() {
  return (
    <div className="min-h-screen bg-gradient-to-b  px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">   
        <div className="overflow-hidden rounded-2xl border bg-white transition-all">
          <div className="p-8 sm:p-12">
            <div className="mb-12">
              <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-800">
                <span className="mr-4 rounded-lg bg-blue-100 p-2 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
                Privacy Policy
              </h2>
              <p className="mb-4 text-base leading-relaxed text-gray-600">
                Last updated: January 1, 2024
              </p>
              <p className="text-sm leading-relaxed text-gray-600">
                We take your privacy seriously and are committed to protecting your personal information. 
                This privacy policy explains how we collect, use, and safeguard your data.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-800">
                <span className="mr-4 rounded-lg bg-green-100 p-2 text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </span>
                Information We Collect
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800 group-hover:text-blue-700">Personal Information</h3>
                  <p className="text-sm text-gray-600 group-hover:text-blue-600">Name, email address, contact information, and any other information you provide to us directly.</p>
                </div>
                <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800 group-hover:text-green-700">Usage Data</h3>
                  <p className="text-sm text-gray-600 group-hover:text-green-600">Browser type, IP address, device information, and cookies data.</p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-800">
                <span className="mr-4 rounded-lg bg-purple-100 p-2 text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </span>
                How We Use Your Information
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-indigo-100">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800 group-hover:text-indigo-700">Service Provision</h3>
                  <p className="text-sm text-gray-600 group-hover:text-indigo-600">To provide and maintain our services</p>
                </div>
                <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-pink-50 hover:to-pink-100">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800 group-hover:text-pink-700">Communication</h3>
                  <p className="text-sm text-gray-600 group-hover:text-pink-600">To contact you and send updates</p>
                </div>
                <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-yellow-50 hover:to-yellow-100">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800 group-hover:text-yellow-700">Improvement</h3>
                  <p className="text-sm text-gray-600 group-hover:text-yellow-600">To analyze and improve our services</p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-800">
                <span className="mr-4 rounded-lg bg-red-100 p-2 text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                Data Security
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-gray-600">
                We implement appropriate security measures to protect your personal information against unauthorized access, 
                alteration, disclosure, or destruction. These measures include:
              </p>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-red-50 hover:to-red-100">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800 group-hover:text-red-700">Encryption</h3>
                  <p className="text-sm text-gray-600 group-hover:text-red-600">All data transmission is encrypted using industry-standard protocols</p>
                </div>
                <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800 group-hover:text-orange-700">Access Controls</h3>
                  <p className="text-sm text-gray-600 group-hover:text-orange-600">Strict access controls and authentication measures</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-800">
                <span className="mr-4 rounded-lg bg-indigo-100 p-2 text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                Contact Us
              </h2>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us using the information below:
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="size-5 text-primary" />
                  <span className="text-foreground text-sm font-medium">{FOOTER_DETAILS.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="size-5 text-primary" />
                  <span className="text-foreground text-sm font-medium">{FOOTER_DETAILS.phone}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="mt-0.5 size-5 text-primary" />
                  <span className="text-foreground text-sm font-medium">{FOOTER_DETAILS.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyBody;