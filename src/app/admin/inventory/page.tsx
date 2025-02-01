import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import type { FC } from 'react';
import Link from 'next/link';
import ProductsTable from './(components)/products-table';
import { verifyPermission } from '@/utils/permissions';
import { getSessionData, getUserId } from '@/lib/auth';
import PageAnimation from '@/components/public/page-animation';
import PageTitle from '@/components/private/page-title';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Inventory | Admin Dashboard',
  description: 'View and manage products'
};  

const PermissionDenied = dynamic(() => import('@/components/private/permission-denied'));

const Page: FC = async () => {
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
        <div className="mb-6 flex items-center justify-between">
          <PageTitle title='Manage Inventory' />
          <Button asChild>
            <Link href="/admin/inventory/new">
              <Plus className="mr-2 size-4" /> Add Product
            </Link>
          </Button>
        </div>
        <ProductsTable />
      </div>
    </PageAnimation>
  );
};

export default Page;