'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, CreditCard, Package, Ticket, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUserStore } from '@/stores/user.store';
import { cn } from '@/lib/utils';
import { useUserImageQuery } from '@/hooks/messages.hooks';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const sidebarLinks = [
  {
    label: 'Account Information',
    icon: User,
    href: '/my-account',
  },
  {
    label: 'Order History',
    icon: Package,
    href: '/my-account/orders',
  },
  {
    label: 'Payment History',
    icon: CreditCard,
    href: '/my-account/payments',
  },
  {
    label: 'Tickets',
    icon: Ticket,
    href: '/my-account/tickets',
  }
];

// Mobile sidebar menu button that shows on small screens
export function MobileSidebarTrigger() {
  const [open, setOpen] = useState(false);
  const { user } = useUserStore();
  const { data: userImage } = useUserImageQuery(user?.clerkId);
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          
          className="fixed bottom-6 right-6 z-50 mt-24 size-14 w-max rounded-full border-2 border-primary bg-white shadow-lg lg:hidden"
        >
          <Menu className="size-24 text-primary" /> Open Menu
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[270px] p-0">
        <SidebarContent 
          userImage={userImage} 
          mobile={true} 
          onNavigate={() => setOpen(false)} 
        />
      </SheetContent>
    </Sheet>
  );
}

// function handleLogout() {
//   const { signOut } = useClerk();
//   const { clearUser } = useUserStore();
  
//   signOut({ redirectUrl: "/" });
//   clearUser();
// }

// The actual sidebar content, used in both desktop and mobile versions
function SidebarContent({ 
  userImage, 
  onNavigate 
}: Readonly<{ 
  userImage?: string; 
  mobile?: boolean;
  onNavigate?: () => void;
}>) {
  const { user } = useUserStore();
  const pathname = usePathname();

  return (
    <div className='flex size-full flex-col bg-white'>
      <div className='flex flex-col items-center border-b p-6'>
        <div className='relative mb-4 size-24 overflow-hidden rounded-full border-2 border-primary/10'>
          <Avatar className='size-24'>
            {userImage ? <Image src={userImage} alt="User Image" width={100} height={100} className="rounded-full" /> : null}
            <AvatarFallback className='bg-primary text-xl text-white'>
              {user?.firstName?.[0] ?? 'U'}
              {user?.lastName?.[0] ?? 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
        <h3 className='text-center text-lg font-semibold'>{user?.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'User'}</h3>
        <p className='text-muted-foreground text-sm'>{user?.email ?? 'email@example.com'}</p>
      </div>
      
      <nav className='flex-1 space-y-2 p-4'>
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link 
              key={link.href} 
              href={link.href} 
              onClick={onNavigate}
            >
              <Button 
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  'w-full justify-start gap-3 h-11',
                  isActive && 'bg-primary/10 hover:bg-primary/15'
                )}
              >
                <Icon className="size-4" />
                {link.label}
              </Button>
            </Link>
          );
        })}
      </nav>
      
      {/* <div className='border-t p-4'>
        <Button 
          variant="ghost" 
          className='w-full justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-500'
          onClick={() => handleLogout()}
        >
          <LogOut className="size-4" />
          Logout
        </Button>
      </div> */}
    </div>
  );
}

function MyProfileSideBar() {
  const { user } = useUserStore();
  const { data: userImage } = useUserImageQuery(user?.clerkId);
  
  return (
    <>
      {/* Desktop sidebar - hidden on mobile */}
      <div className='bg-card hidden w-64 overflow-hidden rounded-md border lg:block'>
        <SidebarContent userImage={userImage} />
      </div>
      
      {/* Mobile floating action button that opens the sidebar sheet */}
      <MobileSidebarTrigger />
    </>
  );
}

export default MyProfileSideBar;