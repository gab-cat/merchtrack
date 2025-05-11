
import React from "react";
import { Metadata } from "next";
import { PaymentsContent } from "@/features/admin/payments/components";
import PageAnimation from "@/components/public/page-animation";
import PageTitle from "@/components/private/page-title";


export const metadata: Metadata = {
  title: "Payments | MerchTrack",
  description: "Process and manage order payments",
};


export default async function PaymentsPage() {
  return (
    <PageAnimation>
      <div className="p-6">
        <PageTitle title="Manage Payments" />
        <PaymentsContent />
      </div>
    </PageAnimation>
  );
}