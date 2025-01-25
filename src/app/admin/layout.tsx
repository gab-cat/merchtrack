import React from "react";
import AdminSidebar from "@/components/private/admin-sidebar";
import SyncUserData from "@/components/misc/sync-user-data";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen text-neutral-7">
      <SyncUserData />
      <AdminSidebar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

