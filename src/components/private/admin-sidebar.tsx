"use client";

import { FiLogOut } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AdminLinks } from "@/constants";
import { useUserStore } from "@/stores/user.store";

export default function AdminSidebar() {
  const { user } = useUserStore();
  const pathname = usePathname();

  return (
    <div className="bg-background flex h-full w-64 flex-col border-r">
      {/* Logo Section */}
      <div className="flex items-center justify-center p-6">
        <Link href="/admin" className="flex flex-col items-center gap-2">
          <div className="relative size-16">
            <Image
              src="/img/logo.png"
              alt="MerchTrack Logo"
              layout="fill"
              objectFit="contain"
              className="w-auto"
            />
          </div>
          <span className="text-2xl font-bold tracking-tight text-primary">MerchTrack</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 border-y py-2">
        <nav className="grid gap-1 px-14 py-4">
          {AdminLinks.map((item) => {
            const isActive = pathname?.includes(item.href); 
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-200 text-primary-600 hover:bg-primary-300"
                    : "text-neutral-7 hover:bg-accent/30 hover:text-primary-800 hover:bg-primary-100"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="size-4 text-primary" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Info and Logout */}
      <div className="mt-auto px-10 py-8">
        <div className="flex items-center gap-2 py-4">
          <div className="relative size-12" suppressHydrationWarning>
            <UserButton appearance={{ 
              elements: {
                userButtonAvatarBox: "w-12 h-12",
                userButtonPopoverCard: "bg-blue-100", 
                userButtonPopoverActionButton: "text-neutral-600",
              }
            }} 
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{user?.firstName} {user?.lastName}</span>
            <span className="text-xs text-gray-600">{user?.isAdmin ? "Admin" : "Staff"}</span>
          </div>
        </div>


        <Button variant="ghost" className="w-full justify-start gap-2">
          <FiLogOut className="size-4" />
          Back to Customer View
        </Button>
      </div>
    </div>
  );
}


