"use client";

import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin-layout";
import { OrdersTable } from "@/components/orders-table";
import { AdminTopbar } from "@/components/admin-topbar";
import { BiDownload, BiTrash, BiUpload } from "react-icons/bi";
import { orders } from "@/types/Misc"; 

export default function AdminOrdersPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <AdminTopbar />
        <div className="space-y-4">
          <div className="rounded-lg border my-4">
            <OrdersTable orders={orders} />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline">
              <BiTrash className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button variant="outline">
              <BiDownload className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button>
              <BiUpload className="mr-2 h-4 w-4" />
              Update
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
