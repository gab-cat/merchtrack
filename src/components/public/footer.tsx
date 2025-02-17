import Image from 'next/image';
import Link from 'next/link';
import { FiFacebook } from "react-icons/fi";
import { FaInstagram, FaTwitter, FaPhoneAlt, FaChevronRight } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { MdOutlineMail } from "react-icons/md";
import { Input } from '../ui/input';
import { FOOTER_DETAILS, FOOTER_LINKS } from '@/constants';
import { Button } from '@/components/ui/button';

const Footer = () => {
  return (
    <footer className="bg-primary-700 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Image
                src="/img/logo-white.png"
                width={60}
                height={60}
                alt="MerchTrack-Footer-Logo"
              />
              <div>
                <h3 className="text-sm font-light">{FOOTER_DETAILS.companyName}</h3>
                <h2 className="text-2xl font-bold tracking-tighter">MerchTrack</h2>
              </div>
            </div>
            <p className="text-sm font-light tracking-wide">{FOOTER_DETAILS.footerText}</p>
          </div>
          
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.map((link: LinkType) => (
                <li key={link.href}>
                  <Link href={link.href} className="flex items-center text-sm font-normal underline transition-colors duration-300 hover:text-blue-200">
                    <FaChevronRight className='mr-2' />{link.displayName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div >
            <h3 className="mb-4 text-lg font-semibold">Contact Us</h3>
            <ul className="space-y-2">
              <li className='text-sm font-light'>
                <Link href={`mailto:${FOOTER_DETAILS.email}`} className="flex items-center underline transition-colors duration-300 hover:text-blue-200">
                  <MdOutlineMail className='mr-2' />{FOOTER_DETAILS.email}
                </Link>
              </li>
              <li className='flex items-center text-sm font-light'><FaPhoneAlt className='mr-2' />{FOOTER_DETAILS.phone}</li>
              <li className='flex items-start text-sm font-light'><FaLocationDot className='mr-2 pt-1'/>{FOOTER_DETAILS.address}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-lg font-semibold">Newsletter</h3>
            <p className="mb-4 text-sm">Stay updated with our latest offers and products.</p>
            <form className="flex w-full">
              <Input
                type="email"
                placeholder="Enter your email"
                className="rounded-r-none bg-neutral-2 text-neutral-7"
              />
              <Button type="button" className="rounded-l-none">
        Subscribe
              </Button>
            </form>
          </div>
        </div>
        
        <div className="mt-12 border-t border-white pt-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p className="text-sm">
              © {new Date().getFullYear()} {FOOTER_DETAILS.sitename}. All Rights Reserved.
            </p>
            <div className="mt-4 flex space-x-4 md:mt-0">
              <Link href="#" className="transition-colors duration-300 hover:text-blue-200">
                <FiFacebook size={24} />
              </Link>
              <Link href="#" className="transition-colors duration-300 hover:text-blue-200">
                <FaInstagram size={24} />
              </Link>
              <Link href="#" className="transition-colors duration-300 hover:text-blue-200">
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

