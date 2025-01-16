import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiFacebook } from "react-icons/fi";
import { FaInstagram, FaTwitter, FaPhoneAlt, FaChevronRight } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { MdOutlineMail } from "react-icons/md";
import { FOOTER_DETAILS, FOOTER_LINKS } from '@/constants';

const Footer = () => {
  return (
    <footer className="bg-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Image
                src="/img/logo-white.png"
                width={60}
                height={60}
                alt="MerchTrack-Footer-Logo"
                className="rounded-full"
              />
              <div>
                <h3 className="text-lg font-semibold">{FOOTER_DETAILS.companyName}</h3>
                <h2 className="text-2xl font-bold">{FOOTER_DETAILS.sitename}</h2>
              </div>
            </div>
            <p className="text-sm font-light">{FOOTER_DETAILS.footerText}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.map((link: LinkType) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-blue-200 text-sm flex transition-colors font-normal items-center duration-300">
                    <FaChevronRight className='mr-2' />{link.displayName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div >
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className='text-sm font-light'>
                <a href={`mailto:${FOOTER_DETAILS.email}`} className="hover:text-blue-200 flex transition-colors duration-300">
                  <MdOutlineMail className='mr-2' />{FOOTER_DETAILS.email}
                </a>
              </li>
              <li className='flex text-sm font-light'><FaPhoneAlt className='mr-2' />{FOOTER_DETAILS.phone}</li>
              <li className='flex text-sm font-light'><FaLocationDot className='mr-2'/>{FOOTER_DETAILS.address}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-sm mb-4">Stay updated with our latest offers and products.</p>
            <form className="flex text-sm">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 w-full text-gray-900 rounded-l-md focus:outline-none"
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-r-md transition-colors duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              © {new Date().getFullYear()} {FOOTER_DETAILS.sitename}. All Rights Reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="#" className="hover:text-blue-200 transition-colors duration-300">
                <FiFacebook size={24} />
              </Link>
              <Link href="#" className="hover:text-blue-200 transition-colors duration-300">
                <FaInstagram size={24} />
              </Link>
              <Link href="#" className="hover:text-blue-200 transition-colors duration-300">
                <FaTwitter size={24} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

