import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import type { FC } from 'react';
import Link from 'next/link';
import { verifyPermission } from '@/utils/permissions';
import { getSessionData, getUserId } from '@/lib/auth';
import PageAnimation from '@/components/public/page-animation';
import PageTitle from '@/components/private/page-title';
import { Button } from '@/components/ui/button';
import ProductsGrid from '@/app/admin/inventory/(components)/products-grid';
import { CreateCategoryModal } from '@/app/admin/inventory/(components)/create-category-modal';

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
          <div className="flex gap-2">
            <CreateCategoryModal />
            <Button asChild>
              <Link href="/admin/inventory/new" className='text-white'>
                <Plus className="mr-2 size-4" /> Add Product
              </Link>
            </Button>
          </div>
        </div>
        <ProductsGrid />
      </div>
    </PageAnimation>
  );
};

export default Page;