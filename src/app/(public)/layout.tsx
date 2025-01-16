import Footer from "@/components/public/footer";
import HeaderLP from "@/components/public/header";


const Layout = ({children}: Readonly<{ children: React.ReactNode }>) => {
  return (
    <>
      <HeaderLP />
      {children}
      <Footer />
    </>
  );
};

export default Layout;