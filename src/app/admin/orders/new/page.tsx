
import PageTitle from "@/components/private/page-title";
import PageAnimation from "@/components/public/page-animation";
import { NewOrderForm } from "@/features/admin/orders/components";


export const metadata = {
  title: "Create New Order | MerchTrack",
  description: "Create and manage new orders",  
};

export default function NewOrderPage() {
  return (
    <PageAnimation>
      <div className="p-6">
        <PageTitle title='Create New Order' />
        <div className="space-y-4">
          <NewOrderForm />
        </div>
      </div>
    </PageAnimation>
  );
}