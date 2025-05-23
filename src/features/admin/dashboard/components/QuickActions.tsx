import { BarChart, Users, ShoppingCart, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <>
      <h2 className="mb-4 text-2xl font-semibold text-gray-900">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/users" className="w-full">
          <Button className="w-full bg-primary-500 text-white transition-colors duration-300 hover:bg-primary-600">
            <Users className="mr-2 size-4" /> Manage Users
          </Button>
        </Link>
        <Link href="/admin/inventory" className="w-full">
          <Button className="w-full bg-primary-500 text-white transition-colors duration-300 hover:bg-primary-600">
            <ShoppingCart className="mr-2 size-4" /> Manage Inventory
          </Button>
        </Link>
        <Link href="/admin/insights" className="w-full">
          <Button className="w-full bg-primary-500 text-white transition-colors duration-300 hover:bg-primary-600">
            <BarChart className="mr-2 size-4" /> View Insights
          </Button>
        </Link>
        <Link href="/admin/settings" className="w-full">
          <Button className="w-full bg-primary-500 text-white transition-colors duration-300 hover:bg-primary-600">
            <Settings className="mr-2 size-4" /> System Settings
          </Button>
        </Link>
      </div>
    </>
  );
}
