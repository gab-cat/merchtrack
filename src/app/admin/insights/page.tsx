import PageTitle from '@/components/private/page-title';
import PageAnimation from '@/components/public/page-animation';
import { InsightsTabs } from '@/features/admin/insights/components';

export const metadata = {  
  title: 'Business Insights | Admin Dashboard',  
  description: 'View business metrics and analytics'  
};  


const Page = () => {

  return (
    <PageAnimation>
      <div className="p-6">
        <PageTitle title='Business Insights' />
        <div className="space-y-4">
          <InsightsTabs />
        </div>
      </div>
    </PageAnimation>
  );
};

export default Page;