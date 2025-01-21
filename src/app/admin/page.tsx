import { BarChart, Users, ShoppingCart, Settings, Bell, MessageSquare } from "lucide-react";
import Link from "next/link";
import { FaUserFriends, FaShoppingCart  } from "react-icons/fa";
import { FaChartSimple } from "react-icons/fa6";
import { MdSettings } from "react-icons/md";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PageAnimation from "@/components/public/page-animation";

export default async function AdminWelcome() {
  const { sessionClaims } = await auth();
  const metadata = sessionClaims?.metadata.data;
  const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const announcements = [
    {
      id: 1,
      title: "New Feature Launch",
      description: "We're excited to announce the launch of our new analytics dashboard!",
    },
    {
      id: 2,
      title: "Scheduled Maintenance",
      description: "There will be scheduled maintenance on July 15th from 2-4 AM EST.",
    },
  ];
  const messageOfTheDay = {
    title: "Embrace Challenges",
    message:
      "Every challenge you face today makes you stronger tomorrow. The challenge of leadership is to be strong, but not rude; be kind, but not weak; be bold, but not bully; be thoughtful, but not lazy; be humble, but not timid; be proud, but not arrogant; have humor, but without folly.",
  };

  return (
    <PageAnimation>
      <div className="min-h-screen p-8 pt-16 font-inter">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Welcome back, {`${metadata?.firstName} ${metadata?.lastName}`}!</h1>
            <p className="mt-2 text-base tracking-tight text-gray-600">
            It&apos;s {currentTime}. Here&apos;s what&apos;s happening in your admin dashboard.
            </p>
          </div>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white shadow transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <FaUserFriends className="size-6 text-primary-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">1,234</div>
              <p className="text-xs text-gray-500">+10% from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
              <FaShoppingCart  className="size-6 text-primary-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">$12,345</div>
              <p className="text-xs text-gray-500">+5% from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Products</CardTitle>
              <FaChartSimple className="size-6 text-primary-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">567</div>
              <p className="text-xs text-gray-500">+2% from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Server Status</CardTitle>
              <MdSettings className="size-6 text-primary-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">Healthy</div>
              <p className="text-xs text-gray-500">99.9% uptime</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <Card className="bg-white shadow transition-all duration-300 ease-in-out hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold tracking-tight text-gray-900">
                <Bell className="mr-2 size-5 text-blue-500" /> Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
              {announcements.map((announcement) => (
                <Alert key={announcement.id} className="mb-4 border-l-4 border-blue-500">
                  <AlertTitle className="text-base font-semibold tracking-tight text-gray-900">{announcement.title}</AlertTitle>
                  <AlertDescription className="text-xs text-gray-600">{announcement.description}</AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
          <Card className="bg-white shadow transition-all duration-300 ease-in-out hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold tracking-tight text-gray-900">
                <MessageSquare className="mr-2 size-5 text-primary-500" /> Message of the Day
              </CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
              <Alert className="border-l-4 border-primary-500">
                <AlertTitle className="text-gray-900">{messageOfTheDay.title}</AlertTitle>
                <AlertDescription className="mt-2 text-gray-600">{messageOfTheDay.message}</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        <h2 className="mb-4 text-2xl font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/users" className="w-full">
            <Button className="w-full bg-primary-500 text-white transition-colors duration-300 hover:bg-primary-600">
              <Users className="mr-2 size-4" /> Manage Users
            </Button>
          </Link>
          <Link href="/admin/products" className="w-full">
            <Button className="w-full bg-primary-500 text-white transition-colors duration-300 hover:bg-primary-600">
              <ShoppingCart className="mr-2 size-4" /> Manage Products
            </Button>
          </Link>
          <Link href="/admin/analytics" className="w-full">
            <Button className="w-full bg-primary-500 text-white transition-colors duration-300 hover:bg-primary-600">
              <BarChart className="mr-2 size-4" /> View Analytics
            </Button>
          </Link>
          <Link href="/admin/settings" className="w-full">
            <Button className="w-full bg-primary-500 text-white transition-colors duration-300 hover:bg-primary-600">
              <Settings className="mr-2 size-4" /> System Settings
            </Button>
          </Link>
        </div>
      </div>
    </PageAnimation>
  );
}

