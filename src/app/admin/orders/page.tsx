"use client";

import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin-layout";
import { OrdersTable } from "@/components/orders-table";
import { AdminTopbar } from "@/components/admin-topbar";
import { Download, Trash2, Upload } from 'lucide-react';

const orders = [
  {
    id: "1",
    orderNo: "#122",
    date: "01/01/02",
    customerName: "Kyla Ronquillo",
    customerType: "student_cocs",
    paymentStatus: "paid",
    paymentMethod: "onsite",
    orderStatus: "pending",
    amount: 120.00,
  },
  {
    id: "2",
    orderNo: "#123",
    date: "01/01/02",
    customerName: "John Doe",
    customerType: "teacher",
    paymentStatus: "partially_paid",
    paymentMethod: "offsite",
    orderStatus: "confirmed",
    amount: 150.00,
  },
  // Add more sample orders as needed
];

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
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Update
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

