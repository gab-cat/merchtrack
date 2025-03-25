'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Users, Lightbulb, Award, Heart } from 'lucide-react';
import { ABOUT_DEVELOPERS, ABOUT_US_CONTENT, ABOUT_DEVELOPERS_LEAD as lead } from '@/constants';
import PageTitle from '@/components/public/page-title';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

function AboutUsBody() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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

  const values = [
    {
      title: "Innovation",
      description: "Pushing boundaries and exploring new possibilities",
      icon: <Lightbulb className="size-6 text-primary" />,
      gradient: "from-blue-50 to-blue-100",
      hoverGradient: "hover:from-primary-50 hover:to-primary-100",
      hoverText: "group-hover:text-primary-700"
    },
    {
      title: "Excellence",
      description: "Delivering quality in everything we do",
      icon: <Award className="size-6 text-primary" />,
      gradient: "from-green-50 to-green-100",
      hoverGradient: "hover:from-green-50 hover:to-green-100",
      hoverText: "group-hover:text-green-700"
    },
    {
      title: "Integrity",
      description: "Building trust through honest practices",
      icon: <Heart className="size-6 text-primary" />,
      gradient: "from-purple-50 to-purple-100",
      hoverGradient: "hover:from-purple-50 hover:to-purple-100",
      hoverText: "group-hover:text-purple-700"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">   
        <motion.div 
          className="overflow-hidden rounded-2xl bg-white shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero Section */}
          <PageTitle
            title={ABOUT_US_CONTENT.title}
            description="Learn about MerchTrack's mission, vision, and the dedicated team behind our innovative merchandise management platform."
          />

          <div className="p-8 sm:p-12">
            {/* Mission Section */}
            <motion.div 
              className="mb-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-800">
                <span className="mr-4 flex size-12 items-center justify-center rounded-lg bg-primary-100 p-2 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label='Mission Icon'>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
                Our Mission
              </h2>
              <div className="rounded-xl bg-blue-50 p-6">
                <p className="text-base text-gray-700">
                  We are dedicated to creating innovative solutions that empower businesses 
                  and individuals to achieve their goals. Through cutting-edge technology 
                  and exceptional service, we strive to make a positive impact in the world.
                </p>
              </div>
            </motion.div>
        
            {/* Values Section */}
            <motion.div 
              className="mb-16"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 className="mb-8 flex items-center text-2xl font-bold text-gray-800">
                <span className="mr-4 flex size-12 items-center justify-center rounded-lg bg-primary-100 p-2 text-primary">
                  <Award className="size-6" />
                </span>
                Our Values
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {values.map((value, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className={`group rounded-xl bg-gradient-to-br ${value.gradient} p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 ${value.hoverGradient}`}
                  >
                    <div className="mb-4 flex size-14 items-center justify-center rounded-lg bg-white/70 shadow-sm">
                      {value.icon}
                    </div>
                    <h3 className={`mb-3 text-lg font-semibold tracking-tight text-gray-800 ${value.hoverText}`}>{value.title}</h3>
                    <p className="text-sm text-gray-700">{value.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
        
            {/* Team Experience Section */}
            <motion.div 
              className="mb-16"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-800">
                <span className="mr-4 flex size-12 items-center justify-center rounded-lg bg-primary-100 p-2 text-primary">
                  <Users className="size-6" />
                </span>
                Our Team
              </h2>
              <p className="mb-8 text-base text-gray-700">
                Our diverse team of experts brings together years of experience in 
                software development, design, and customer service. We&apos;re passionate 
                about creating solutions that make a difference.
              </p>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <motion.div variants={itemVariants} className="group overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="flex size-16 items-center justify-center rounded-lg bg-white/70 shadow-sm">
                      <Lightbulb className="size-8 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Creativity</h3>
                      <p className="text-sm text-gray-700">Inspiring ideas that shape the future</p>
                    </div>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="group overflow-hidden rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="flex size-16 items-center justify-center rounded-lg bg-white/70 shadow-sm">
                      <Users className="size-8 text-pink-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Community</h3>
                      <p className="text-sm text-gray-700">Empowering connections and fostering growth</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
    
            {/* Developers Section */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 className="mb-8 flex items-center text-2xl font-bold text-gray-800">
                <span className="mr-4 flex size-12 items-center justify-center rounded-lg bg-primary-100 p-2 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
                Meet Our Developers
              </h2>

              {/* Lead Developer */}
              <motion.div 
                variants={itemVariants}
                className="from-primary-50 mb-12 overflow-hidden rounded-xl bg-gradient-to-r to-blue-50 p-8 shadow-sm"
              >
                <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
                  <div className="mb-6 sm:mb-0 sm:mr-8">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="cursor-pointer">
                          <div className="relative mx-auto inline-block size-40 overflow-hidden rounded-xl bg-white p-1 shadow-md sm:mx-0">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-200 to-primary-400 opacity-50 blur-md"></div>
                            <div className="relative size-full overflow-hidden rounded-lg">
                              <Image
                                src={lead.image}
                                alt={`${lead.name}'s Profile Picture`}
                                height={300}
                                width={300}
                                className="size-full object-cover transition-transform duration-300 hover:scale-105"
                              />
                            </div>
                          </div>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 backdrop-blur-sm">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <div className="overflow-hidden rounded-lg">
                              <Image 
                                src={lead.image} 
                                alt={lead.name}
                                width={60}
                                height={60}
                                className="size-14 object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-primary">{lead.name}</h4>
                              <p className="text-sm text-gray-600">{lead.role}</p>
                              <div className="mt-2 flex gap-2">
                                {lead.github && (
                                  <a 
                                    href={`https://github.com/${lead.github}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex size-7 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-primary hover:text-white"
                                  >
                                    <svg className="size-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M12 2C6.477 2 2 6.477 2 12C2 16.42 4.87 20.17 8.84 21.5C9.34 21.58 9.5 21.27 9.5 21C9.5 20.77 9.5 20.14 9.5 19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.12 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.97 18 9.54 17.76C9.63 17.11 9.89 16.67 10.17 16.42C7.95 16.17 5.62 15.31 5.62 11.5C5.62 10.39 6 9.5 6.65 8.79C6.55 8.54 6.2 7.5 6.75 6.15C6.75 6.15 7.59 5.88 9.5 7.17C10.29 6.95 11.15 6.84 12 6.84C12.85 6.84 13.71 6.95 14.5 7.17C16.41 5.88 17.25 6.15 17.25 6.15C17.8 7.5 17.45 8.54 17.35 8.79C18 9.5 18.38 10.39 18.38 11.5C18.38 15.32 16.04 16.16 13.81 16.41C14.17 16.72 14.5 17.33 14.5 18.26C14.5 19.6 14.5 20.68 14.5 21C14.5 21.27 14.66 21.59 15.17 21.5C19.14 20.16 22 16.42 22 12C22 6.477 17.523 2 12 2Z" fill="currentColor"/>
                                    </svg>
                                  </a>
                                )}
                                
                                {lead.linkedin && (
                                  <a 
                                    href={`https://linkedin.com/in/${lead.linkedin}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex size-7 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-blue-600 hover:text-white"
                                  >
                                    <svg className="size-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M20.47 2H3.53C2.64 2 2 2.64 2 3.53V20.47C2 21.36 2.64 22 3.53 22H20.47C21.36 22 22 21.36 22 20.47V3.53C22 2.64 21.36 2 20.47 2ZM8.09 18.74H5.07V9.24H8.09V18.74ZM6.59 7.98C5.61 7.98 4.82 7.19 4.82 6.21C4.82 5.23 5.61 4.44 6.59 4.44C7.57 4.44 8.36 5.23 8.36 6.21C8.36 7.19 7.56 7.98 6.59 7.98ZM18.91 18.74H15.89V14.47C15.89 13.31 15.87 11.8 14.25 11.8C12.6 11.8 12.35 13.09 12.35 14.41V18.74H9.33V9.24H12.21V10.55H12.25C12.64 9.8 13.58 9.01 15 9.01C18.06 9.01 18.91 11.09 18.91 13.8V18.74Z" fill="currentColor"/>
                                    </svg>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-2 space-y-3">
                            <p className="text-sm text-neutral-7">
                              {lead.bio ?? "Leading our development team with expertise in full-stack development and a passion for creating elegant, user-friendly applications."}
                            </p>
                            
                            {/* <div className="flex flex-wrap gap-2">
                              {['React', 'Node.js', 'TypeScript', 'AWS'].map((skill, index) => (
                                <span key={index} className="bg-primary-50 rounded-full px-3 py-1 text-xs font-medium text-primary">
                                  {skill}
                                </span>
                              ))}
                            </div> */}
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  <div>
                    <div className="mb-2 inline-flex rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary">
                      Team Lead
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-gray-800">{lead.name}</h3>
                    <p className="mb-4 text-lg text-gray-600">{lead.role}</p>
                    <p className="text-sm text-gray-600">
                      Leading our development team with expertise in full-stack development
                      and a passion for creating elegant, user-friendly applications.
                    </p>
                    <div className="mt-4 flex gap-2">
                      {lead.github && (
                        <a 
                          href={`https://github.com/${lead.github}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-primary/10 hover:text-primary"
                        >
                          <svg className="size-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.477 2 2 6.477 2 12C2 16.42 4.87 20.17 8.84 21.5C9.34 21.58 9.5 21.27 9.5 21C9.5 20.77 9.5 20.14 9.5 19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.12 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.97 18 9.54 17.76C9.63 17.11 9.89 16.67 10.17 16.42C7.95 16.17 5.62 15.31 5.62 11.5C5.62 10.39 6 9.5 6.65 8.79C6.55 8.54 6.2 7.5 6.75 6.15C6.75 6.15 7.59 5.88 9.5 7.17C10.29 6.95 11.15 6.84 12 6.84C12.85 6.84 13.71 6.95 14.5 7.17C16.41 5.88 17.25 6.15 17.25 6.15C17.8 7.5 17.45 8.54 17.35 8.79C18 9.5 18.38 10.39 18.38 11.5C18.38 15.32 16.04 16.16 13.81 16.41C14.17 16.72 14.5 17.33 14.5 18.26C14.5 19.6 14.5 20.68 14.5 21C14.5 21.27 14.66 21.59 15.17 21.5C19.14 20.16 22 16.42 22 12C22 6.477 17.523 2 12 2Z" fill="currentColor"/>
                          </svg>
                          <span>@{lead.github}</span>
                        </a>
                      )}
                      
                      {lead.linkedin && (
                        <a 
                          href={`https://linkedin.com/in/${lead.linkedin}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                        >
                          <svg className="size-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.47 2H3.53C2.64 2 2 2.64 2 3.53V20.47C2 21.36 2.64 22 3.53 22H20.47C21.36 22 22 21.36 22 20.47V3.53C22 2.64 21.36 2 20.47 2ZM8.09 18.74H5.07V9.24H8.09V18.74ZM6.59 7.98C5.61 7.98 4.82 7.19 4.82 6.21C4.82 5.23 5.61 4.44 6.59 4.44C7.57 4.44 8.36 5.23 8.36 6.21C8.36 7.19 7.56 7.98 6.59 7.98ZM18.91 18.74H15.89V14.47C15.89 13.31 15.87 11.8 14.25 11.8C12.6 11.8 12.35 13.09 12.35 14.41V18.74H9.33V9.24H12.21V10.55H12.25C12.64 9.8 13.58 9.01 15 9.01C18.06 9.01 18.91 11.09 18.91 13.8V18.74Z" fill="currentColor"/>
                          </svg>
                          <span>LinkedIn</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Developer Team */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {ABOUT_DEVELOPERS.map((developer, index) => (
                  <motion.div 
                    key={index} 
                    variants={itemVariants}
                    className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-blue-50 hover:shadow-md"
                  >
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="cursor-pointer">
                          <div className="from-primary-50 mb-4 overflow-hidden rounded-xl bg-gradient-to-r to-primary-100 shadow-inner">
                            <Image
                              src={developer.image}
                              alt={`${developer.name}'s Profile Picture`}
                              height={300}
                              width={300}
                              className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <h3 className="mb-1 text-lg font-semibold text-gray-800 group-hover:text-primary">{developer.name}</h3>
                          <p className="text-sm text-gray-600">{developer.role}</p>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-72 backdrop-blur-sm">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <div className="overflow-hidden rounded-lg">
                              <Image 
                                src={developer.image} 
                                alt={developer.name}
                                width={50}
                                height={50}
                                className="size-12 object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-primary">{developer.name}</h4>
                              <p className="text-xs text-gray-500">{developer.role}</p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600">
                            {developer.bio || "Software developer passionate about creating elegant, user-friendly applications."}
                          </p>
                          
                          <div className="mt-2 flex gap-2">
                            {developer.github && (
                              <a 
                                href={`https://github.com/${developer.github}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-primary/10 hover:text-primary"
                              >
                                <svg className="size-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 2C6.477 2 2 6.477 2 12C2 16.42 4.87 20.17 8.84 21.5C9.34 21.58 9.5 21.27 9.5 21C9.5 20.77 9.5 20.14 9.5 19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.12 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.97 18 9.54 17.76C9.63 17.11 9.89 16.67 10.17 16.42C7.95 16.17 5.62 15.31 5.62 11.5C5.62 10.39 6 9.5 6.65 8.79C6.55 8.54 6.2 7.5 6.75 6.15C6.75 6.15 7.59 5.88 9.5 7.17C10.29 6.95 11.15 6.84 12 6.84C12.85 6.84 13.71 6.95 14.5 7.17C16.41 5.88 17.25 6.15 17.25 6.15C17.8 7.5 17.45 8.54 17.35 8.79C18 9.5 18.38 10.39 18.38 11.5C18.38 15.32 16.04 16.16 13.81 16.41C14.17 16.72 14.5 17.33 14.5 18.26C14.5 19.6 14.5 20.68 14.5 21C14.5 21.27 14.66 21.59 15.17 21.5C19.14 20.16 22 16.42 22 12C22 6.477 17.523 2 12 2Z" fill="currentColor"/>
                                </svg>
                                <span>@{developer.github}</span>
                              </a>
                            )}
                            
                            {developer.linkedin && (
                              <a 
                                href={`https://linkedin.com/in/${developer.linkedin}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                              >
                                <svg className="size-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M20.47 2H3.53C2.64 2 2 2.64 2 3.53V20.47C2 21.36 2.64 22 3.53 22H20.47C21.36 22 22 21.36 22 20.47V3.53C22 2.64 21.36 2 20.47 2ZM8.09 18.74H5.07V9.24H8.09V18.74ZM6.59 7.98C5.61 7.98 4.82 7.19 4.82 6.21C4.82 5.23 5.61 4.44 6.59 4.44C7.57 4.44 8.36 5.23 8.36 6.21C8.36 7.19 7.56 7.98 6.59 7.98ZM18.91 18.74H15.89V14.47C15.89 13.31 15.87 11.8 14.25 11.8C12.6 11.8 12.35 13.09 12.35 14.41V18.74H9.33V9.24H12.21V10.55H12.25C12.64 9.8 13.58 9.01 15 9.01C18.06 9.01 18.91 11.09 18.91 13.8V18.74Z" fill="currentColor"/>
                                </svg>
                                <span>LinkedIn</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AboutUsBody;
