import { type FC } from "react";
import { BiDownload, BiTrash, BiUpload } from "react-icons/bi";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { AdminTopbar } from "@/components/private/admin-topbar";
import { OrdersTable } from "@/components/private/orders-table";
import PageAnimation from "@/components/public/page-animation";
import { verifyPermission } from "@/utils/permissions";
import { Button } from "@/components/ui/button";
import { getSessionData, getUserId } from "@/lib/auth";

export const metadata = {
  title: 'Orders | Admin Dashboard',
  description: 'View and manage orders'
};  

const PermissionDenied = dynamic(() => import('@/components/private/permission-denied'));

const AdminOrdersPage: FC = async () => {
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
        <AdminTopbar />
        <div className="space-y-4">
          <div className="my-4 rounded-lg">
            <OrdersTable />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline">
              <BiTrash className="mr-2 size-4" />
              Delete
            </Button>
            <Button variant="outline">
              <BiDownload className="mr-2 size-4" />
              Download
            </Button>
            <Button className="text-white">
              <BiUpload className="mr-2 size-4" />
              Update
            </Button>
          </div>
        </div>
      </div>
    </PageAnimation>

  );
};

export default AdminOrdersPage;

