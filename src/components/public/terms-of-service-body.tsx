import React from 'react';
import { Mail, Phone, MapPin } from "lucide-react";
import { FOOTER_DETAILS, TERMS_OF_SERVICE_CONTENT } from '@/constants';

function TermsOfServiceBody() {
  return (
    <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">   
        <div className="overflow-hidden rounded-2xl border bg-white transition-all">
          <div className="p-8 sm:p-12">
            {/* Header */}
            <div className="mb-12">
              <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-800">
                <span className="mr-4 rounded-lg bg-blue-100 p-2 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                {TERMS_OF_SERVICE_CONTENT.title}
              </h2>
              <p className="mb-4 text-base leading-relaxed text-gray-600">
                Last updated: {TERMS_OF_SERVICE_CONTENT.lastUpdated}
              </p>
            </div>

            {/* Introduction */}
            <div className="mb-12">
              <p className="text-base leading-relaxed text-gray-600">
                {TERMS_OF_SERVICE_CONTENT.sections[0].content}
              </p>
            </div>

            {/* Definitions */}
            <div className="mb-12">
              <h2 className="mb-6 text-2xl font-bold text-gray-800">
                {TERMS_OF_SERVICE_CONTENT.sections[1].title}
              </h2>
              <div className="prose prose-gray max-w-none">
                <div className="whitespace-pre-line text-gray-600">
                  {TERMS_OF_SERVICE_CONTENT.sections[1].content}
                </div>
              </div>
            </div>

            {/* Account Registration and Security */}
            <div className="mb-12">
              <h2 className="mb-6 text-2xl font-bold text-gray-800">
                {TERMS_OF_SERVICE_CONTENT.sections[2].title}
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                  <div className="whitespace-pre-line text-gray-600">
                    {TERMS_OF_SERVICE_CONTENT.sections[2].content}
                  </div>
                </div>
              </div>
            </div>

            {/* User Obligations and IP Rights */}
            <div className="mb-12">
              <h2 className="mb-6 text-2xl font-bold text-gray-800">
                {TERMS_OF_SERVICE_CONTENT.sections[3].title}
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                  <div className="whitespace-pre-line text-gray-600">
                    {TERMS_OF_SERVICE_CONTENT.sections[3].content}
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                  <h3 className="mb-4 text-xl font-semibold text-gray-800">
                    {TERMS_OF_SERVICE_CONTENT.sections[4].title}
                  </h3>
                  <div className="whitespace-pre-line text-gray-600">
                    {TERMS_OF_SERVICE_CONTENT.sections[4].content}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Terms and Service Availability */}
            <div className="mb-12">
              <h2 className="mb-6 text-2xl font-bold text-gray-800">Service Terms</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                  <h3 className="mb-4 text-xl font-semibold text-gray-800">
                    {TERMS_OF_SERVICE_CONTENT.sections[5].title}
                  </h3>
                  <div className="whitespace-pre-line text-gray-600">
                    {TERMS_OF_SERVICE_CONTENT.sections[5].content}
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                  <h3 className="mb-4 text-xl font-semibold text-gray-800">
                    {TERMS_OF_SERVICE_CONTENT.sections[6].title}
                  </h3>
                  <div className="whitespace-pre-line text-gray-600">
                    {TERMS_OF_SERVICE_CONTENT.sections[6].content}
                  </div>
                </div>
              </div>
            </div>

            {/* Liability and Dispute Resolution */}
            <div className="mb-12">
              <h2 className="mb-6 text-2xl font-bold text-gray-800">Legal Terms</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                  <h3 className="mb-4 text-xl font-semibold text-gray-800">
                    {TERMS_OF_SERVICE_CONTENT.sections[7].title}
                  </h3>
                  <div className="whitespace-pre-line text-gray-600">
                    {TERMS_OF_SERVICE_CONTENT.sections[7].content}
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                  <h3 className="mb-4 text-xl font-semibold text-gray-800">
                    {TERMS_OF_SERVICE_CONTENT.sections[8].title}
                  </h3>
                  <div className="whitespace-pre-line text-gray-600">
                    {TERMS_OF_SERVICE_CONTENT.sections[8].content}
                  </div>
                </div>
              </div>
            </div>

            {/* Termination and Changes */}
            <div className="mb-12">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                  <h3 className="mb-4 text-xl font-semibold text-gray-800">
                    {TERMS_OF_SERVICE_CONTENT.sections[9].title}
                  </h3>
                  <div className="whitespace-pre-line text-gray-600">
                    {TERMS_OF_SERVICE_CONTENT.sections[9].content}
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                  <h3 className="mb-4 text-xl font-semibold text-gray-800">
                    {TERMS_OF_SERVICE_CONTENT.sections[10].title}
                  </h3>
                  <div className="whitespace-pre-line text-gray-600">
                    {TERMS_OF_SERVICE_CONTENT.sections[10].content}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="mb-8 flex items-center text-2xl font-bold text-gray-800">
                <span className="mr-4 rounded-lg bg-indigo-100 p-2 text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                {TERMS_OF_SERVICE_CONTENT.sections[11].title}
              </h2>
              <div className="mb-8 whitespace-pre-line text-gray-600">
                {TERMS_OF_SERVICE_CONTENT.sections[11].content}
              </div>
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

export default TermsOfServiceBody;