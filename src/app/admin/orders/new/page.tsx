import { NewOrderForm } from "@/components/forms/new-order-form";
import PageTitle from "@/components/private/page-title";
import PageAnimation from "@/components/public/page-animation";

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