'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Shield, Lock, Eye, Globe, Trash, Clock, Bell } from "lucide-react";
import { FOOTER_DETAILS, PRIVACY_POLICY_CONTENT } from '@/constants';

function PrivacyPolicyBody() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const sectionIcons = {
    collection: <Eye className="size-6 text-blue-600" />,
    usage: <Lock className="size-6 text-indigo-600" />,
    sharing: <Globe className="size-6 text-green-600" />,
    security: <Shield className="size-6 text-red-600" />,
    rights: <Bell className="size-6 text-orange-600" />,
    cookies: <Clock className="size-6 text-purple-600" />,
    children: <Trash className="size-6 text-pink-600" />,
  };

  return (
    <div className="min-h-screen py-16">
      <div className="mx-auto max-w-6xl">   
        <motion.div 
          className="overflow-hidden rounded-2xl bg-white shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero Section */}
          <div className="p-2 sm:p-12">
            {/* Introduction */}
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
                <p className="text-base leading-relaxed text-gray-700">
                  {PRIVACY_POLICY_CONTENT.sections[0].content}
                </p>
              </div>
            </motion.div>

            {/* Main Content Sections */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-12"
            >
              {/* Information Collection */}
              <motion.div variants={itemVariants} className="rounded-xl border border-gray-100 p-6 shadow-sm">
                <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-800">
                  <span className="mr-4 flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    {sectionIcons.collection}
                  </span>
                  {PRIVACY_POLICY_CONTENT.sections[1].title}
                </h2>
                <div className="whitespace-pre-line text-sm text-gray-600">
                  {PRIVACY_POLICY_CONTENT.sections[1].content}
                </div>
              </motion.div>

              {/* Information Usage */}
              <motion.div variants={itemVariants} className="rounded-xl border border-gray-100 p-6 shadow-sm">
                <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-800">
                  <span className="mr-4 flex size-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    {sectionIcons.usage}
                  </span>
                  {PRIVACY_POLICY_CONTENT.sections[2].title}
                </h2>
                <div className="whitespace-pre-line text-sm text-gray-600">
                  {PRIVACY_POLICY_CONTENT.sections[2].content}
                </div>
              </motion.div>

              {/* Data Security and Sharing */}
              <motion.div variants={itemVariants}>
                <h2 className="mb-6 text-2xl font-bold text-gray-800">Data Protection</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center text-xl font-semibold text-gray-800">
                      <span className="mr-3 flex size-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                        {sectionIcons.sharing}
                      </span>
                      {PRIVACY_POLICY_CONTENT.sections[3].title}
                    </h3>
                    <div className="whitespace-pre-line text-sm text-gray-600">
                      {PRIVACY_POLICY_CONTENT.sections[3].content}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center text-xl font-semibold text-gray-800">
                      <span className="mr-3 flex size-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                        {sectionIcons.security}
                      </span>
                      {PRIVACY_POLICY_CONTENT.sections[4].title}
                    </h3>
                    <div className="whitespace-pre-line text-sm text-gray-600">
                      {PRIVACY_POLICY_CONTENT.sections[4].content}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* User Rights and Cookies */}
              <motion.div variants={itemVariants}>
                <h2 className="mb-6 text-2xl font-bold text-gray-800">Your Privacy</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center text-xl font-semibold text-gray-800">
                      <span className="mr-3 flex size-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                        {sectionIcons.rights}
                      </span>
                      {PRIVACY_POLICY_CONTENT.sections[5].title}
                    </h3>
                    <div className="whitespace-pre-line text-sm text-gray-600">
                      {PRIVACY_POLICY_CONTENT.sections[5].content}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center text-xl font-semibold text-gray-800">
                      <span className="mr-3 flex size-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                        {sectionIcons.cookies}
                      </span>
                      {PRIVACY_POLICY_CONTENT.sections[6].title}
                    </h3>
                    <div className="whitespace-pre-line text-sm text-gray-600">
                      {PRIVACY_POLICY_CONTENT.sections[6].content}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Children's Privacy and International Transfers */}
              <motion.div variants={itemVariants}>
                <h2 className="mb-6 text-2xl font-bold text-gray-800">Special Considerations</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center text-xl font-semibold text-gray-800">
                      <span className="mr-3 flex size-8 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
                        {sectionIcons.children}
                      </span>
                      {PRIVACY_POLICY_CONTENT.sections[7].title}
                    </h3>
                    <div className="whitespace-pre-line text-sm text-gray-600">
                      {PRIVACY_POLICY_CONTENT.sections[7].content}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-sm">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800">
                      {PRIVACY_POLICY_CONTENT.sections[8].title}
                    </h3>
                    <div className="whitespace-pre-line text-sm text-gray-600">
                      {PRIVACY_POLICY_CONTENT.sections[8].content}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Changes to Privacy Policy */}
              <motion.div variants={itemVariants} className="rounded-xl border border-gray-100 p-6 shadow-sm">
                <h2 className="mb-6 text-2xl font-bold text-gray-800">
                  {PRIVACY_POLICY_CONTENT.sections[9].title}
                </h2>
                <div className="whitespace-pre-line text-sm text-gray-600">
                  {PRIVACY_POLICY_CONTENT.sections[9].content}
                </div>
              </motion.div>

              {/* Contact Information */}
              <motion.div variants={itemVariants} className="bg-primary-50 mt-8 rounded-xl border border-primary-100 p-6">
                <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-800">
                  <span className="mr-4 flex size-10 items-center justify-center rounded-lg bg-primary-100 text-primary">
                    <Mail className="size-6" />
                  </span>
                  {PRIVACY_POLICY_CONTENT.sections[10].title}
                </h2>
                <div className="whitespace-pre-line text-gray-700">
                  {PRIVACY_POLICY_CONTENT.sections[10].content}
                </div>
                <div className="space-y-4 rounded-lg bg-white p-6">
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
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default PrivacyPolicyBody;