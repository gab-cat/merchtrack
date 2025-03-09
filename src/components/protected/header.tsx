'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { Search, ShoppingCart, Menu, X, Bell } from 'lucide-react';
import { FaUserShield } from "react-icons/fa";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';


export default function ProtectedHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cartItems , setCartOpen } = useCartStore();
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Home', href: '/dashboard' },
    { name: 'Merch', href: '/products' },
    { name: 'My Orders', href: '/my-account/orders' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      // Redirect to products page with search query
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Clear search after submission
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex h-16  items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            className="block md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
          
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/img/logo.png"
              alt="MerchTrack Logo"
              width={40}
              height={40}
              className="h-8 w-auto"
            />
            <span className="hidden text-xl font-bold md:inline-block">MerchTrack</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-4 md:flex lg:space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith(item.href)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Search, Notifications, Cart, User */}
        <div className="flex items-center gap-2 md:gap-4">
          <form onSubmit={handleSearch} className="relative hidden w-40 md:flex lg:w-64">
            <Input
              type="search"
              placeholder="Search products..."
              className="pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0"
            >
              <Search className="size-4" />
              <span className="sr-only">Search</span>
            </Button>
          </form>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-5" />
            <Badge className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full p-0">
              2
            </Badge>
          </Button>
          
          <Button variant="ghost" size="icon" className="relative" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="size-5" />
            {cartItems?.length > 0 && (
              <Badge className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full p-0">
                {cartItems.length}
              </Badge>
            )}
            <span className="sr-only">Shopping Cart</span>
          </Button>
          
          <UserButton appearance={{ 
            elements: {
              userButtonAvatarBox: "size-8",
              userButtonPopoverCard: "bg-blue-100", 
              userButtonPopoverActionButton: "text-neutral-600",
            }
          }} >
            <UserButton.MenuItems>
              <UserButton.Action labelIcon={<FaUserShield className='size-4'/>} label="Switch To Admin View" onClick={() => router.push("/admin")} />
            </UserButton.MenuItems>
          </UserButton>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t md:hidden">
          <div className="mx-auto max-w-4xl p-4">
            <form onSubmit={handleSearch} className="relative mb-4">
              <Input
                type="search"
                placeholder="Search products..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
              >
                <Search className="size-4" />
                <span className="sr-only">Search</span>
              </Button>
            </form>
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname.startsWith(item.href)
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}