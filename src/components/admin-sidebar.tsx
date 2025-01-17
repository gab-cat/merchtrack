import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart2, Box, LogOut, Mail, ShoppingCart, Users, Wallet } from 'lucide-react';
import Link from "next/link";
import Image from "next/image"; 

const navigation = [
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    current: true,
  },
  {
    name: "Payments",
    href: "/admin/payments",
    icon: Wallet,
    current: false,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    current: false,
  },
  {
    name: "Inventory",
    href: "/admin/inventory",
    icon: Box,
    current: false,
  },
  {
    name: "Messages",
    href: "/admin/messages",
    icon: Mail,
    current: false,
  },
  {
    name: "Insights",
    href: "/admin/insights",
    icon: BarChart2,
    current: false,
  },
];

export function AdminSidebar() {
  return (
    <div className="w-64 flex flex-col border-r bg-background">
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
        <nav className="grid gap-1 px-10">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent",
                item.current ? "bg-accent" : "transparent"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </ScrollArea>

      {/* Avatar and then logout */}
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
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}