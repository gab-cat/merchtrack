"use client";

import { FiLogOut } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { MdAnnouncement } from "react-icons/md";
import { FaUserAlt } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AdminLinks } from "@/constants";
import { useUserStore } from "@/stores/user.store";

export default function AdminSidebar() {
  const { user } = useUserStore();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="bg-background flex h-full w-64 flex-col border-r">
      {/* Logo Section */}
      <div className="flex items-center justify-center p-6">
        <Link href="/admin" className="flex flex-col items-center gap-2">
          <div className="relative size-16">
            <Image
              src="/img/logo.png"
              alt="MerchTrack Logo"
              className="w-auto"
              width={64}
              height={64}
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
            <SignedIn>
              <UserButton appearance={{ 
                elements: {
                  userButtonAvatarBox: "w-12 h-12",
                  userButtonPopoverCard: "bg-blue-100", 
                  userButtonPopoverActionButton: "text-neutral-600",
                }
              }} 
              >
                <UserButton.MenuItems>
                  <UserButton.Action labelIcon={<MdAnnouncement />} label="Announcements" onClick={() => router.push("/admin/settings")}/>
                  <UserButton.Action labelIcon={<FaUserAlt />} label="Back to Customer View" onClick={() => router.push("/dashboard")} />
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{user?.firstName} {user?.lastName}</span>
            <span className="text-xs text-gray-600">{user?.isAdmin ? "Admin" : "Staff"}</span>
          </div>
        </div>


        <Button onClick={() => router.push("/dashboard")} variant="ghost" className="w-full justify-start gap-2">
          <FiLogOut className="size-4" />
          Back to Customer View
        </Button>
      </div>
    </div>
  );
}


