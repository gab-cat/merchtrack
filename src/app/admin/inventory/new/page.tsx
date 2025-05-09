import type { FC } from 'react';
import PageAnimation from '@/components/public/page-animation';
import PageTitle from '@/components/private/page-title';
import { NewProductContainer } from '@/features/admin/inventory/components';

export const metadata = {
  title: 'Create Product | Admin Dashboard',
  description: 'Create a new product'
};  

const Page: FC = () => {
  return (
    <PageAnimation>
      <div className="p-6">
        <PageTitle title='New Product' />
        <div className="space-y-4">
          <NewProductContainer />
        </div>
      </div>
    </PageAnimation>
  );
};

export default Page;