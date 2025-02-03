import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import type { FC } from 'react';
import UpdateProductContainer from './(components)/update-product-container';
import { getSessionData, getUserId } from '@/lib/auth';
import { verifyPermission } from '@/utils/permissions';
import PageAnimation from '@/components/public/page-animation';
import PageTitle from '@/components/private/page-title';

const PermissionDenied = dynamic(() => import('@/components/private/permission-denied'));



interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const Page: FC<PageProps> = async ({ params }) => {
  const { metadata } = await getSessionData();
  const userId = getUserId(metadata);
  const slug = (await params).slug;
    
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
        <PageTitle title="Update Product" />
        <UpdateProductContainer slug={slug} />
      </div>
    </PageAnimation>
  );
};

export default Page;
