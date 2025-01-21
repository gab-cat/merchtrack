import PrivacyPolicyBody from '@/components/public/privacy-policy-body';
import { PRIVACY_POLICY_CONTENT } from '@/constants';
import PageTitle from '@/components/public/page-title';
import PageAnimation from '@/components/public/page-animation';

const Page = () => {
  return (
    <PageAnimation className='max-w-4xl'>
      <PageTitle title={PRIVACY_POLICY_CONTENT.title} description={PRIVACY_POLICY_CONTENT.description} />
      <PrivacyPolicyBody />
    </PageAnimation>
  );
};

export default Page;