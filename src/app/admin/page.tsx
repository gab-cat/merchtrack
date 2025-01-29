import { FaUserFriends, FaShoppingCart } from "react-icons/fa";
import { FaChartSimple } from "react-icons/fa6";
import { MdSettings } from "react-icons/md";
import { getSessionData } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Dashboard",
  description: "Welcome back to your admin dashboard",
};

export default async function AdminWelcome() {
  const { metadata } = await getSessionData();
  
  if (!metadata?.data) {
    return redirect('/auth/sign-in');
  }
  
  const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

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
    message: "Every challenge you face today makes you stronger tomorrow. The challenge of leadership is to be strong, but not rude; be kind, but not weak; be bold, but not bully; be thoughtful, but not lazy; be humble, but not timid; be proud, but not arrogant; have humor, but without folly.",
  };

  return (
    <PageAnimation>
      <div className="min-h-screen p-8 pt-16 font-inter">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Welcome back, {`${metadata?.firstName} ${metadata?.lastName}`}!
            </h1>
            <p className="mt-2 text-base tracking-tight text-gray-600">
              It&apos;s {currentTime}. Here&apos;s what&apos;s happening in your admin dashboard.
            </p>
          </div>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Users" value="1,234" subtext="+10% from last month" Icon={FaUserFriends} />
          <StatCard title="Total Sales" value="$12,345" subtext="+5% from last month" Icon={FaShoppingCart} />
          <StatCard title="Active Products" value="567" subtext="+2% from last month" Icon={FaChartSimple} />
          <StatCard title="Server Status" value="Healthy" subtext="99.9% uptime" Icon={MdSettings} />
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <AnnouncementsCard announcements={announcements} />
          <MessageOfTheDayCard title={messageOfTheDay.title} message={messageOfTheDay.message} />
        </div>

        <QuickActions />
      </div>
    </PageAnimation>
  );
}

