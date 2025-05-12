import { type FC } from "react";
import { BiDownload, BiTrash, BiUpload } from "react-icons/bi";
import { AdminTopbar , OrdersTable } from "@/features/admin/orders/components";
import PageAnimation from "@/components/public/page-animation";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: 'Orders | Admin Dashboard',
  description: 'View and manage orders'
};  


const AdminOrdersPage: FC = () => {
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

