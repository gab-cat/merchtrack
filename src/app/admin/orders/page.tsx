"use client";

import { type FC } from "react";
import { BiDownload, BiTrash, BiUpload } from "react-icons/bi";
import { Button } from "@/components/ui/button";
import { OrdersTable } from "@/components/private/orders-table";
import { AdminTopbar } from "@/components/private/admin-topbar";
import { orders } from "@/types/Misc";

const AdminOrdersPage: FC = () => {
  return (
    <div className="p-6">
      <AdminTopbar />
      <div className="space-y-4">
        <div className="my-4 rounded-lg border">
          <OrdersTable orders={orders} />
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
  );
};

export default AdminOrdersPage;
