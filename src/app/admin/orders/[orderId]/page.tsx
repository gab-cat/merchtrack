import { redirect } from "next/navigation";
import Link from "next/link";
import { RiArrowGoBackFill } from "react-icons/ri";
import { OrderDetails } from "@/features/admin/orders/components";
import { getUserId, getSessionData } from "@/lib/auth";
import PageAnimation from "@/components/public/page-animation";
import "@/components/ui/alert-dialog";
import PageTitle from "@/components/private/page-title";
import { Button } from "@/components/ui/button";


interface Props {
  params: Promise<{
    orderId: string;
  }>;
}

export const metadata = {
  title: 'Order Details | Admin Dashboard',
  description: 'View order details and manage orders'
};

export default async function OrderDetailPage({ params }: Readonly<Props>) {
  const { metadata } = await getSessionData();
  const userId = getUserId(metadata);
  
  if (!userId) {
    return redirect('/sign-in');
  }

  const { orderId } = await params;

  return (
    <PageAnimation>
      <div className="p-6">
        <PageTitle title="Order Details" />
        <Link href="/admin/orders" className="flex w-full justify-end pr-4">
          <Button variant="outline" className="flex items-center">
            <RiArrowGoBackFill />
            Back to Orders
          </Button>
        </Link>
        <OrderDetails orderId={orderId} userId={userId} />
      </div>
    </PageAnimation>
  );
}