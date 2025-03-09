import SyncUserData from "@/components/misc/sync-user-data";
import ProtectedHeader from "@/components/protected/header";
import ProtectedFooter from "@/components/protected/footer";
import { CartProvider } from "@/providers/cart-provider";

const Layout = ({children}: Readonly<{ children: React.ReactNode }>) => {
  return (
    <div className="flex min-h-screen flex-col text-neutral-7">
      <SyncUserData />
      <CartProvider>
        <ProtectedHeader />
        <main className="flex-1">
          {children}
        </main>
        <ProtectedFooter />
      </CartProvider>
    </div>
  );
};

export default Layout;