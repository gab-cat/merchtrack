import { FaUserFriends, FaShoppingCart } from "react-icons/fa";
import { FaChartSimple } from "react-icons/fa6";
import { MdSettings } from "react-icons/md";
import { getAnnouncements } from "./settings/_actions";
import { getSessionData } from "@/lib/auth";
import { getDashboardStats } from "@/actions/dashboard.actions";
import { AnnouncementsCard } from "@/app/admin/components/AnnouncementsCard";
import { MessageOfTheDayCard } from "@/app/admin/components/MessageOfTheDayCard";
import { QuickActions } from "@/app/admin/components/QuickActions";
import { StatCard } from "@/app/admin/components/StatCard";
import PageAnimation from "@/components/public/page-animation";
import { ExtendedAnnouncement } from "@/types/announcement";

export const metadata = {
  title: "Admin Dashboard",
  description: "Welcome back to your admin dashboard",
};

export default async function AdminWelcome() {
  const { metadata } = await getSessionData();
  const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  
  const [announcementsResult, statsResult] = await Promise.all([
    getAnnouncements(10),
    getDashboardStats()
  ]);

  const announcements = announcementsResult.success ? announcementsResult.data : [];
  const stats = statsResult.success ? statsResult.data : null;
  
  const messageOfTheDay = Array.isArray(announcements) ? announcements.find(a => a.type === "SYSTEM") : undefined;
  const normalAnnouncements = Array.isArray(announcements) ? announcements.filter(a => a.type === "NORMAL").map(a => ({
    id: a.id,
    title: a.title,
    content: a.content,
    level: a.level,
    createdAt: a.createdAt,
    publishedBy: a.publishedBy,
    updatedAt: a.updatedAt
  })) : [];

  return (
    <PageAnimation>
      <div className="min-h-screen p-8 pt-16 font-inter">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Welcome back, {`${metadata?.data?.firstName} ${metadata?.data?.lastName}`}!
            </h1>
            <p className="mt-2 text-base tracking-tight text-gray-600">
              It&apos;s {currentTime}. Here&apos;s what&apos;s happening in your admin dashboard.
            </p>
          </div>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Users" 
            value={stats ? stats.users.total.toLocaleString() : "---"} 
            subtext={stats ? `${stats.users.change}% from last month` : "Loading..."} 
            Icon={FaUserFriends} 
          />
          <StatCard 
            title="Total Sales" 
            value={stats ? `₱${stats.sales.total.toLocaleString()}` : "---"} 
            subtext={stats ? `${stats.sales.change}% from last month` : "Loading..."} 
            Icon={FaShoppingCart} 
          />
          <StatCard 
            title="Active Products" 
            value={stats ? stats.products.total.toLocaleString() : "---"} 
            subtext={stats ? `${stats.products.change}% from last month` : "Loading..."} 
            Icon={FaChartSimple} 
          />
          <StatCard 
            title="Server Status" 
            value={stats ? stats.system.status : "---"} 
            subtext={stats ? stats.system.subtext : "Loading..."} 
            Icon={MdSettings} 
          />
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <AnnouncementsCard announcements={normalAnnouncements as ExtendedAnnouncement[]} />
          {messageOfTheDay && (
            <MessageOfTheDayCard 
              title={messageOfTheDay.title} 
              message={messageOfTheDay.content} 
            />
          )}
        </div>

        <QuickActions />
      </div>
    </PageAnimation>
  );
}

