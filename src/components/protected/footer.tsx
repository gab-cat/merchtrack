'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Mail, Phone, MapPin } from 'lucide-react';

export default function ProtectedFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-r from-slate-900 to-blue-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="flex flex-col space-y-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src="/img/logo-white.png"
                alt="MerchTrack Logo"
                width={40}
                height={40}
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold">MerchTrack</span>
            </Link>
            <p className="text-sm text-gray-300">
              Your one-stop solution for merchandise tracking and management.
              Simplify your inventory, boost your sales, and delight your customers.
            </p>
            <div className="flex space-x-4 pt-2">
              <Link target='_blank' referrerPolicy='no-referrer' href="https://www.facebook.com/GoldinBlue" className="flex items-center rounded-md border border-neutral-3 px-2 py-1 text-neutral-3 transition-colors hover:border-primary hover:text-primary">
                <Facebook size={20} className='mr-1' />
                <span className="text-sm">Gold In Blue</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-bold">Quick Links</h3>
            <div className="grid grid-cols-1 gap-2">
              <Link href="/dashboard" className="text-sm text-gray-300 transition-colors hover:text-white">
                Dashboard
              </Link>
              <Link href="/products" className="text-sm text-gray-300 transition-colors hover:text-white">
                Browse Products
              </Link>
              <Link href="/my-account/orders" className="text-sm text-gray-300 transition-colors hover:text-white">
                My Orders
              </Link>
              <Link href="/track-order" className="text-sm text-gray-300 transition-colors hover:text-white">
                Track Order
              </Link>
              <Link href="/my-account/tickets" className="text-sm text-gray-300 transition-colors hover:text-white">
                Contact Support
              </Link>
            </div>
          </div>

          {/* Help & Support */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-bold">Help & Support</h3>
            <div className="grid grid-cols-1 gap-2">
              <Link href="/how-it-works" className="text-sm text-gray-300 transition-colors hover:text-white">
                How It Works
              </Link>
              <Link href="/faqs" className="text-sm text-gray-300 transition-colors hover:text-white">
                FAQs
              </Link>
              <Link href="/privacy-policy" className="text-sm text-gray-300 transition-colors hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-sm text-gray-300 transition-colors hover:text-white">
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-bold">Contact Us</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Mail size={16} className="shrink-0" />
                <Link href="mailto:support@merchtrack.tech" className="transition-colors hover:text-white">
                  support@merchtrack.tech
                </Link>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Phone size={16} className="shrink-0" />
                <Link href="tel:+639936167562" className="transition-colors hover:text-white">
                  +63 (993) 616-7562
                </Link>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-300">
                <MapPin size={16} className="mt-1 shrink-0" />
                <address className="not-italic">
                  Ateneo de Naga University<br />
                  Bagumbayan Sur, Naga City 4400<br />
                </address>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-10 border-t border-gray-700 pt-6">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p className="text-sm text-gray-400">
              © {currentYear} MerchTrack. All rights reserved.
            </p>
            <div className="mt-4 flex space-x-6 md:mt-0">
              <Link href="/privacy-policy" className="text-xs text-gray-400 transition-colors hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-xs text-gray-400 transition-colors hover:text-white">
                Terms of Service
              </Link>
              <Link href="/sitemap.xml" className="text-xs text-gray-400 transition-colors hover:text-white">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}