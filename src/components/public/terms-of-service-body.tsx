'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, FileText, Shield, ScrollText, DollarSign, Bookmark } from "lucide-react";
import { FOOTER_DETAILS, TERMS_OF_SERVICE_CONTENT } from '@/constants';

function TermsOfServiceBody() {
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
    definitions: <Bookmark className="size-6 text-primary" />,
    account: <Shield className="size-6 text-primary" />,
    obligations: <ScrollText className="size-6 text-primary" />,
    ip: <FileText className="size-6 text-primary" />,
    payment: <DollarSign className="size-6 text-primary" />,
  };

  return (
    <div className="min-h-screen px-2 py-16 ">
      <div className="mx-auto max-w-6xl">   
        <motion.div 
          className="overflow-hidden rounded-2xl bg-white shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="">
            {/* Introduction */}
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
                <p className="text-base leading-relaxed text-gray-700">
                  {TERMS_OF_SERVICE_CONTENT.sections[0].content}
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
              {/* Definitions */}
              <motion.div variants={itemVariants} className="rounded-xl border border-gray-100 p-6 shadow-sm">
                <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-800">
                  <span className="mr-4 flex size-10 items-center justify-center rounded-lg bg-blue-100 text-primary">
                    {sectionIcons.definitions}
                  </span>
                  {TERMS_OF_SERVICE_CONTENT.sections[1].title}
                </h2>
                <div className="prose prose-blue max-w-none">
                  <div className="whitespace-pre-line text-sm text-gray-600">
                    {TERMS_OF_SERVICE_CONTENT.sections[1].content}
                  </div>
                </div>
              </motion.div>

              {/* Account Registration and Security */}
              <motion.div variants={itemVariants} className="rounded-xl border border-gray-100 p-6 shadow-sm">
                <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-800">
                  <span className="mr-4 flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                    {sectionIcons.account}
                  </span>
                  {TERMS_OF_SERVICE_CONTENT.sections[2].title}
                </h2>
                <div className="whitespace-pre-line text-sm text-gray-600">
                  {TERMS_OF_SERVICE_CONTENT.sections[2].content}
                </div>
              </motion.div>

              {/* User Obligations and IP Rights */}
              <motion.div variants={itemVariants}>
                <h2 className="mb-6 text-2xl font-bold text-gray-800">Legal Terms</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center text-xl font-semibold text-gray-800">
                      <span className="mr-3 flex size-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                        {sectionIcons.obligations}
                      </span>
                      {TERMS_OF_SERVICE_CONTENT.sections[3].title}
                    </h3>
                    <div className="whitespace-pre-line text-sm text-gray-600">
                      {TERMS_OF_SERVICE_CONTENT.sections[3].content}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center text-xl font-semibold text-gray-800">
                      <span className="mr-3 flex size-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                        {sectionIcons.ip}
                      </span>
                      {TERMS_OF_SERVICE_CONTENT.sections[4].title}
                    </h3>
                    <div className="whitespace-pre-line text-sm text-gray-600">
                      {TERMS_OF_SERVICE_CONTENT.sections[4].content}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Payment Terms and Service Availability */}
              <motion.div variants={itemVariants}>
                <h2 className="mb-6 text-2xl font-bold text-gray-800">Service Terms</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center text-xl font-semibold text-gray-800">
                      <span className="mr-3 flex size-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                        {sectionIcons.payment}
                      </span>
                      {TERMS_OF_SERVICE_CONTENT.sections[5].title}
                    </h3>
                    <div className="whitespace-pre-line text-sm text-gray-600">
                      {TERMS_OF_SERVICE_CONTENT.sections[5].content}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-sm">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800">
                      {TERMS_OF_SERVICE_CONTENT.sections[6].title}
                    </h3>
                    <div className="whitespace-pre-line text-sm text-gray-600">
                      {TERMS_OF_SERVICE_CONTENT.sections[6].content}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Liability and Dispute Resolution */}
              <motion.div variants={itemVariants}>
                <h2 className="mb-6 text-2xl font-bold text-gray-800">Liability</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-sm">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800">
                      {TERMS_OF_SERVICE_CONTENT.sections[7].title}
                    </h3>
                    <div className="whitespace-pre-line text-sm text-gray-600">
                      {TERMS_OF_SERVICE_CONTENT.sections[7].content}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-sm">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800">
                      {TERMS_OF_SERVICE_CONTENT.sections[8].title}
                    </h3>
                    <div className="whitespace-pre-line text-sm text-gray-600">
                      {TERMS_OF_SERVICE_CONTENT.sections[8].content}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Termination and Changes */}
              <motion.div variants={itemVariants}>
                <h2 className="mb-6 text-2xl font-bold text-gray-800">Changes & Termination</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-sm">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800">
                      {TERMS_OF_SERVICE_CONTENT.sections[9].title}
                    </h3>
                    <div className="whitespace-pre-line text-sm text-gray-600">
                      {TERMS_OF_SERVICE_CONTENT.sections[9].content}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-sm">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800">
                      {TERMS_OF_SERVICE_CONTENT.sections[10].title}
                    </h3>
                    <div className="whitespace-pre-line text-sm text-gray-600">
                      {TERMS_OF_SERVICE_CONTENT.sections[10].content}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Contact Information */}
              <motion.div variants={itemVariants} className="bg-primary-50 mt-8 rounded-xl border border-primary-100 p-6">
                <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-800">
                  <span className="mr-4 flex size-10 items-center justify-center rounded-lg bg-primary-100 text-primary">
                    <Mail className="size-6" />
                  </span>
                  {TERMS_OF_SERVICE_CONTENT.sections[11].title}
                </h2>
                <div className="whitespace-pre-line text-gray-700">
                  {TERMS_OF_SERVICE_CONTENT.sections[11].content}
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

export default TermsOfServiceBody;