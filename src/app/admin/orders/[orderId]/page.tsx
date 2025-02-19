import { redirect } from "next/navigation";
import { OrderDetails } from "./order-details";
import { getUserId, getSessionData } from "@/lib/auth";
import { verifyPermission } from "@/utils/permissions";
import PageAnimation from "@/components/public/page-animation";
import PermissionDenied from "@/components/private/permission-denied";
import "@/components/ui/alert-dialog";
import PageTitle from "@/components/private/page-title";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RiArrowGoBackFill } from "react-icons/ri";

interface Props {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function OrderDetailPage({ params }: Readonly<Props>) {
  const { metadata } = await getSessionData();
  const userId = getUserId(metadata);
  
  if (!userId) {
    return redirect('/sign-in');
  }

  if (!await verifyPermission({
    userId,
    permissions: {
      dashboard: { canRead: true },
      orders: { canUpdate: true }
    }
  })) {
    return <PermissionDenied />;
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