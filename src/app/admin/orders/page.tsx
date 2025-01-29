import { type FC } from "react";
import { BiDownload, BiTrash, BiUpload } from "react-icons/bi";
import dynamic from "next/dynamic";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { AdminTopbar } from "@/components/private/admin-topbar";
import PageAnimation from "@/components/public/page-animation";
import { verifyPermission } from "@/utils/permissions";
import { OrdersTable } from "@/components/private/orders-table";


const PermissionDenied = dynamic(() => import("@/components/private/permission-denied"));

export const metadata = {  
  title: 'Orders | Admin Dashboard',
  description: 'View and manage orders'
};  

const AdminOrdersPage: FC = async () => {
  const { sessionClaims } = await auth();

  if (!await verifyPermission({
    userId: sessionClaims?.metadata.data.id as string,
    permissions: {
      dashboard: { canRead: true },
    }
  })) return <PermissionDenied />;

  


  return (
    <PageAnimation>
      <div className="p-6">
        <AdminTopbar />
        <div className="space-y-4">
          <div className="my-4 rounded-lg border">
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
