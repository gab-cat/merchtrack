"use client";

import { FiLogOut } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AdminLinks } from "@/constants";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="bg-background flex w-64 flex-col border-r">
      {/* Logo Section */}
      <div className="flex items-center justify-center p-6">
        <Link href="/admin" className="flex flex-col items-center gap-2">
          <Image
            src="/img/logo.png"
            alt="MerchTrack Logo"
            width={64}
            height={64}
            className="w-auto"
          />
          <span className="text-2xl font-bold tracking-tighter text-neutral-7">MerchTrack</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
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
          <Image 
            src="/img/sample_pfp.jpg" 
            alt="User" 
            className="size-16 rounded-full" 
            width={64} // Match the actual dimensions (h-16 = 64px)
            height={64} 
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Kyla Ronquillo</span>
            <span className="text-xs text-gray-600">Admin</span>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <FiLogOut className="size-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}

