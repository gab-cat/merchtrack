import Footer from '@/components/public/footer';

export default async function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <>
      <div>{children}</div>
      <Footer />
    </>
    
  );
}