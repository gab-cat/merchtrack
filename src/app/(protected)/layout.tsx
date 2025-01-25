import SyncUserData from "@/components/misc/sync-user-data";
import Footer from "@/components/public/footer";
import HeaderLP from "@/components/public/header";


const Layout = ({children}: Readonly<{ children: React.ReactNode }>) => {
  return (
    <div className="flex flex-col text-neutral-7">
      <SyncUserData />
      <HeaderLP />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;