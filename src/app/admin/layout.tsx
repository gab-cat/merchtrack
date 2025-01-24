import React from "react";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { AdminSidebar } from "@/components/private/admin-sidebar";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { sessionClaims } = await auth();
  if (!sessionClaims?.metadata?.data.isStaff) {
    return notFound();
  }

  return (
    <div className="text-neutral-7 flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

