"use client";

import React from "react";
import { Dialog } from "@radix-ui/react-dialog";
import { AdminSidebar } from "@/components/private/admin-sidebar";

class AdminErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4">Something went wrong. Please try again.</div>;
    }
    return this.props.children;
  }
}

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen text-neutral-7">
      <AdminSidebar />
      <AdminErrorBoundary>
        <Dialog>
          <div className="flex-1">
            {children}
          </div>
        </Dialog>
      </AdminErrorBoundary>
    </div>
  );
}

