import { AdminSidebar } from "./admin-sidebar";

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}

