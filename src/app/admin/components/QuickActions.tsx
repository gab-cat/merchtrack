import { BarChart, Users, ShoppingCart, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <>
      <h2 className="mb-4 text-2xl font-semibold text-gray-900">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/users" className="w-full">
          <Button className="bg-primary-500 hover:bg-primary-600 w-full text-white transition-colors duration-300">
            <Users className="mr-2 size-4" /> Manage Users
          </Button>
        </Link>
        <Link href="/admin/products" className="w-full">
          <Button className="bg-primary-500 hover:bg-primary-600 w-full text-white transition-colors duration-300">
            <ShoppingCart className="mr-2 size-4" /> Manage Products
          </Button>
        </Link>
        <Link href="/admin/analytics" className="w-full">
          <Button className="bg-primary-500 hover:bg-primary-600 w-full text-white transition-colors duration-300">
            <BarChart className="mr-2 size-4" /> View Analytics
          </Button>
        </Link>
        <Link href="/admin/settings" className="w-full">
          <Button className="bg-primary-500 hover:bg-primary-600 w-full text-white transition-colors duration-300">
            <Settings className="mr-2 size-4" /> System Settings
          </Button>
        </Link>
      </div>
    </>
  );
}
