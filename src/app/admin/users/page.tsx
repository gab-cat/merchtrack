import PageTitle from "@/components/private/page-title";
import { UserManagement } from "@/app/admin/users/components/user-management";

export const metadata = {  
  title: 'Users | Admin Dashboard',  
  description: 'Check and manage users',  
};  


export default function UsersPage() {
  return (
    <div className="container mx-auto px-8 py-6">
      <PageTitle title="Users" />
      <UserManagement />
    </div>
  );
}

