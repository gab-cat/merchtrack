import { Metadata } from 'next';
import HowItWorksBody from './components/how-it-works-body';
import PageAnimation from '@/components/public/page-animation';
import PageTitle from '@/components/public/page-title';

export const metadata: Metadata = {
  title: 'How It Works | MerchTrack',
  description: 'Learn how to use MerchTrack in an interactive step-by-step guide.',
};

export const revalidate = 86400;

export default function HowItWorksPage() {
  return (
    <PageAnimation className="max-w-5xl">
      <PageTitle
        title="How It Works"
        description="Discover how easy it is to use MerchTrack with our interactive guide"
      />
      <HowItWorksBody />
    </PageAnimation>
  );
}