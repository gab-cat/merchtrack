import { Plus } from 'lucide-react';
import type { FC } from 'react';
import Link from 'next/link';
import PageAnimation from '@/components/public/page-animation';
import PageTitle from '@/components/private/page-title';
import { Button } from '@/components/ui/button';
import { ProductsGrid, CreateCategoryModal } from '@/features/admin/inventory/components';

export const metadata = {
  title: 'Inventory | Admin Dashboard',
  description: 'View and manage products'
};  


const Page: FC = () => {
  
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