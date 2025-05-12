import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import PageTitle from '@/components/private/page-title';

export function AdminTopbar() {
  return (
    <div className="space-y-4">
      <PageTitle title="Manage Orders" />
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-4">
          <Link href='/admin/orders/new'>
            <Button className="text-white">
              <Plus className="mr-2 size-4" />
            Add Order
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

