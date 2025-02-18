import { redirect } from "next/navigation";
import { OrderDetails } from "./order-details";
import { getUserId, getSessionData } from "@/lib/auth";
import { verifyPermission } from "@/utils/permissions";
import PageAnimation from "@/components/public/page-animation";
import PermissionDenied from "@/components/private/permission-denied";
import "@/components/ui/alert-dialog";
import PageTitle from "@/components/private/page-title";

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
        <OrderDetails orderId={orderId} userId={userId} />
      </div>
    </PageAnimation>
  );
}