import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Footer from '@/components/public/footer';

export default async function RootLayout({ children }: { readonly children: React.ReactNode }) {
  if ((await auth()).sessionClaims?.metadata.isOnboardingCompleted === true) {
    redirect('/');
  }

  return (
    <>
      <div>{children}</div>
      <Footer />
    </>
    
  );
}