'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function ProtectedFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-r from-slate-900 to-blue-900 text-white">
      <div className="mx-auto max-w-4xl px-4 py-10">
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
              <Link href="#" className="transition-colors hover:text-blue-400">
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="transition-colors hover:text-blue-400">
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="transition-colors hover:text-blue-400">
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
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
              <Link href="/my-orders" className="text-sm text-gray-300 transition-colors hover:text-white">
                My Orders
              </Link>
              <Link href="/track-order" className="text-sm text-gray-300 transition-colors hover:text-white">
                Track Order
              </Link>
              <Link href="/transaction-history" className="text-sm text-gray-300 transition-colors hover:text-white">
                Transaction History
              </Link>
            </div>
          </div>

          {/* Help & Support */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-bold">Help & Support</h3>
            <div className="grid grid-cols-1 gap-2">
              <Link href="/faq" className="text-sm text-gray-300 transition-colors hover:text-white">
                FAQ
              </Link>
              <Link href="/shipping-policy" className="text-sm text-gray-300 transition-colors hover:text-white">
                Shipping Policy
              </Link>
              <Link href="/return-policy" className="text-sm text-gray-300 transition-colors hover:text-white">
                Return Policy
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
                <Mail size={16} />
                <a href="mailto:support@merchtrack.com" className="transition-colors hover:text-white">
                  support@merchtrack.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Phone size={16} />
                <a href="tel:+18005551234" className="transition-colors hover:text-white">
                  +1 (800) 555-1234
                </a>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-300">
                <MapPin size={16} className="mt-1 shrink-0" />
                <address className="not-italic">
                  123 Commerce Way<br />
                  Suite 100<br />
                  San Francisco, CA 94103
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
              <Link href="/sitemap" className="text-xs text-gray-400 transition-colors hover:text-white">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}