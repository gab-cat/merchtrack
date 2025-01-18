"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FiLogOut } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import { AdminLinks } from "@/constants/admin-navigation";
import { usePathname } from "next/navigation";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 flex flex-col border-r bg-background">
      {/* Logo Section */}
      <div className="p-6 flex justify-center items-center">
        <Link href="/admin" className="flex flex-col items-center gap-2">
          <Image
            src="/img/logo.png"
            alt="MerchTrack Logo"
            width={64}
            height={64}
            className="w-auto"
          />
          <span className="text-xl font-semibold">MerchTrack</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-14 py-4">
          {AdminLinks.map((item) => {
            const isActive = pathname?.startsWith(item.href); // Allow partial match for subpaths

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                  pathname?.startsWith(item.href)
                    ? "bg-accent/50 text-accent-foreground hover:bg-accent/60"
                    : "text-muted-foreground hover:bg-accent/30 hover:text-accent-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Info and Logout */}
      <div className="mt-auto px-10 py-8">
        <div className="flex items-center gap-4 py-4">
          <Avatar>
            <AvatarImage src="/placeholder.svg" alt="User" />
            <AvatarFallback>KR</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Kyla Ronquillo</span>
            <span className="text-xs text-muted-foreground">Admin</span>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <FiLogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}

