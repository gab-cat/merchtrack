import React from "react";
import AdminSidebar from "@/components/private/admin-sidebar";
import SyncUserData from "@/components/misc/sync-user-data";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex">
      <SyncUserData />
      <div className="fixed left-0 top-0 h-screen">
        <AdminSidebar />
      </div>
      <div className="ml-64 flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

