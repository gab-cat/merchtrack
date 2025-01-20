"use client";

import { AdminSidebar } from "@/components/private/admin-sidebar";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen text-neutral-7">
      <AdminSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}

