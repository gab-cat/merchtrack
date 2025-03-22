import PrivacyPolicyBody from '@/components/public/privacy-policy-body';
import { PRIVACY_POLICY_CONTENT } from '@/constants';
import PageTitle from '@/components/public/page-title';
import PageAnimation from '@/components/public/page-animation';

export const revalidate = 86400;

const Page: React.FC = () => {
  return (
    <PageAnimation className='max-w-6xl'>
      <PageTitle title={PRIVACY_POLICY_CONTENT.title} description={PRIVACY_POLICY_CONTENT.description} />
      <PrivacyPolicyBody />
    </PageAnimation>
  );
};

export default Page;