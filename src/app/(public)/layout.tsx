import Footer from "@/components/public/footer";
import HeaderLP from "@/components/public/header";


const Layout = ({children}: Readonly<{ children: React.ReactNode }>) => {
  return (
    <div className="flex flex-col text-neutral-7">
      <HeaderLP />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;