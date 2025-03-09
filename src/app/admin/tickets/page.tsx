import { Metadata } from "next";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import PageTitle from "@/components/private/page-title";
import PageAnimation from "@/components/public/page-animation";
import { getSessionData, getUserId } from "@/lib/auth";
import { verifyPermission } from "@/utils/permissions";

export const metadata: Metadata = {
  title: "Support Tickets | MerchTrack",
  description: "Manage and handle customer support tickets",
};

const TicketsContent = dynamic(() => import("./components/tickets-content"));
const PermissionDenied = dynamic(() => import("@/components/private/permission-denied"));

export default async function TicketsPage() {
  const { metadata } = await getSessionData();
  const userId = getUserId(metadata);

  if (!userId) {
    return redirect("/sign-in");
  }

  if (
    !(await verifyPermission({
      userId,
      permissions: {
        dashboard: { canRead: true },
      },
    }))
  ) {
    return <PermissionDenied />;
  }

  return (
    <PageAnimation>
      <div className="p-6">
        <PageTitle title="Support Tickets" />
        <TicketsContent />
      </div>
    </PageAnimation>
  );
}