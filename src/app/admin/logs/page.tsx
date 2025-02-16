import React from "react";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

import PageAnimation from "@/components/public/page-animation";
import PageTitle from "@/components/private/page-title";
import { getSessionData, getUserId } from "@/lib/auth";
import { verifyPermission } from "@/utils/permissions";

const LogsContent = dynamic(() => import('@/app/admin/logs/components/logs-content').then(mod => ({ default: mod.LogsContent })));
const PermissionDenied = dynamic(() => import('@/components/private/permission-denied'));

export const metadata: Metadata = {
  title: "Logs | MerchTrack",
  description: "Oversee and manage activity logs",
};

export default async function LogsPage() {
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
      <div className="space-y-6 p-6">
        <PageTitle 
          title="Logs and Audits" 
          level={1}
        />
        <LogsContent />
      </div>
    </PageAnimation>
  );
}