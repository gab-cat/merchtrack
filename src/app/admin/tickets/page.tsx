import { Metadata } from "next";
import PageTitle from "@/components/private/page-title";
import PageAnimation from "@/components/public/page-animation";
import { TicketsContent } from "@/features/admin/tickets/components";

export const metadata: Metadata = {
  title: "Support Tickets | MerchTrack",
  description: "Manage and handle customer support tickets",
};


export default function TicketsPage() {
  return (
    <PageAnimation>
      <div className="p-6">
        <PageTitle title="Support Tickets" />
        <TicketsContent />
      </div>
    </PageAnimation>
  );
}