
import React from "react";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { PaymentsContent } from "./components/payments-content";
import PageAnimation from "@/components/public/page-animation";
import PageTitle from "@/components/private/page-title";
import { getSessionData, getUserId } from "@/lib/auth";
import { verifyPermission } from "@/utils/permissions";

export const metadata: Metadata = {
  title: "Payments | MerchTrack",
  description: "Process and manage order payments",
};

const PermissionDenied = dynamic(() => import('@/components/private/permission-denied'));

export default async function PaymentsPage() {
  const { metadata } = await getSessionData();
  const userId = getUserId(metadata);
      
  if (!userId) {
    return redirect('/sign-in');
  }
    
  if (!await verifyPermission({
    userId,
    permissions: {
      dashboard: { canRead: true },
    }
  })) {
    return <PermissionDenied />;
  }
  return (
    <PageAnimation>
      <div className="p-6">
        <PageTitle title="Manage Payments" />
        <PaymentsContent />
      </div>
    </PageAnimation>
  );
}