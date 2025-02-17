import React from 'react';
import { Mail, Phone, MapPin, Shield } from "lucide-react";
import { FOOTER_DETAILS, PRIVACY_POLICY_CONTENT } from '@/constants';

function PrivacyPolicyBody() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">   
        <div className="overflow-hidden rounded-2xl bg-white transition-all">
          <div className="p-8 sm:p-12">
            {/* Header */}
            <div className="mb-12">
              <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-800">
                <span className="mr-4 rounded-lg bg-green-100 p-2 text-green-600">
                  <Shield className="size-6" />
                </span>
                {PRIVACY_POLICY_CONTENT.title}
              </h2>
              <p className="mb-4 text-base leading-relaxed text-gray-600">
                Last updated: {PRIVACY_POLICY_CONTENT.lastUpdated}
              </p>
            </div>

            {/* Introduction */}
            <div className="mb-12">
              <p className="text-base leading-relaxed text-gray-600">
                {PRIVACY_POLICY_CONTENT.sections[0].content}
              </p>
            </div>

            {/* Information Collection */}
            <div className="mb-12">
              <h2 className="mb-6 text-2xl font-bold text-gray-800">
                {PRIVACY_POLICY_CONTENT.sections[1].title}
              </h2>
              <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="whitespace-pre-line text-gray-600">
                  {PRIVACY_POLICY_CONTENT.sections[1].content}
                </div>
              </div>
            </div>

            {/* Information Usage */}
            <div className="mb-12">
              <h2 className="mb-6 text-2xl font-bold text-gray-800">
                {PRIVACY_POLICY_CONTENT.sections[2].title}
              </h2>
              <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="whitespace-pre-line text-gray-600">
                  {PRIVACY_POLICY_CONTENT.sections[2].content}
                </div>
              </div>
            </div>

            {/* Data Security and Sharing */}
            <div className="mb-12">
              <h2 className="mb-6 text-2xl font-bold text-gray-800">Data Protection</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                  <h3 className="mb-4 text-xl font-semibold text-gray-800">
                    {PRIVACY_POLICY_CONTENT.sections[3].title}
                  </h3>
                  <div className="whitespace-pre-line text-gray-600">
                    {PRIVACY_POLICY_CONTENT.sections[3].content}
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                  <h3 className="mb-4 text-xl font-semibold text-gray-800">
                    {PRIVACY_POLICY_CONTENT.sections[4].title}
                  </h3>
                  <div className="whitespace-pre-line text-gray-600">
                    {PRIVACY_POLICY_CONTENT.sections[4].content}
                  </div>
                </div>
              </div>
            </div>

            {/* User Rights and Cookies */}
            <div className="mb-12">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                  <h3 className="mb-4 text-xl font-semibold text-gray-800">
                    {PRIVACY_POLICY_CONTENT.sections[5].title}
                  </h3>
                  <div className="whitespace-pre-line text-gray-600">
                    {PRIVACY_POLICY_CONTENT.sections[5].content}
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                  <h3 className="mb-4 text-xl font-semibold text-gray-800">
                    {PRIVACY_POLICY_CONTENT.sections[6].title}
                  </h3>
                  <div className="whitespace-pre-line text-gray-600">
                    {PRIVACY_POLICY_CONTENT.sections[6].content}
                  </div>
                </div>
              </div>
            </div>

            {/* Children's Privacy and International Transfers */}
            <div className="mb-12">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                  <h3 className="mb-4 text-xl font-semibold text-gray-800">
                    {PRIVACY_POLICY_CONTENT.sections[7].title}
                  </h3>
                  <div className="whitespace-pre-line text-gray-600">
                    {PRIVACY_POLICY_CONTENT.sections[7].content}
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                  <h3 className="mb-4 text-xl font-semibold text-gray-800">
                    {PRIVACY_POLICY_CONTENT.sections[8].title}
                  </h3>
                  <div className="whitespace-pre-line text-gray-600">
                    {PRIVACY_POLICY_CONTENT.sections[8].content}
                  </div>
                </div>
              </div>
            </div>

            {/* Changes and Contact */}
            <div className="mb-12">
              <h2 className="mb-6 text-2xl font-bold text-gray-800">
                {PRIVACY_POLICY_CONTENT.sections[9].title}
              </h2>
              <div className="mb-8 whitespace-pre-line text-gray-600">
                {PRIVACY_POLICY_CONTENT.sections[9].content}
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="mb-8 flex items-center text-2xl font-bold text-gray-800">
                <span className="mr-4 rounded-lg bg-blue-100 p-2 text-blue-600">
                  <Mail className="size-6" />
                </span>
                {PRIVACY_POLICY_CONTENT.sections[10].title}
              </h2>
              <div className="mb-8 whitespace-pre-line text-gray-600">
                {PRIVACY_POLICY_CONTENT.sections[10].content}
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

export default PrivacyPolicyBody;