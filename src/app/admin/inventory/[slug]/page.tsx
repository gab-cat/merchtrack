import type { FC } from 'react';
import { UpdateProductContainer } from '@/features/admin/inventory/components';
import PageAnimation from '@/components/public/page-animation';
import PageTitle from '@/components/private/page-title';


interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const metadata = {
  title: 'Update Product | Admin Dashboard',
  description: 'Update product details'
};

const Page: FC<PageProps> = async ({ params }) => {
  const slug = (await params).slug;

  return (
    <PageAnimation>
      <div className="p-6">
        <PageTitle title="Update Product" />
        <UpdateProductContainer slug={slug} />
      </div>
    </PageAnimation>
  );
};

export default Page;
