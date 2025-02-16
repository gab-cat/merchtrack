import { Metadata } from "next";
import PageTitle from "@/components/private/page-title";
import { UserManagement } from "@/app/admin/users/components/user-management";
import PageAnimation from "@/components/public/page-animation";

export const metadata: Metadata = {  
  title: 'User Management - MerchTrack',  
  description: 'View and manage all users, filter by role and college, and manage user access.',  
  openGraph: {
    title: 'User Management - MerchTrack',
    description: 'View and manage all users, filter by role and college, and manage user access.',
  }
};  

export default function UsersPage() {
  return (
    <PageAnimation>
      <div className="p-6">
        <PageTitle title="Users Management" />
        <UserManagement />
      </div>
    </PageAnimation>
  );
}

