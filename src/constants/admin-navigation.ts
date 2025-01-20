import { 
  MdShoppingCart, 
  MdPayments, 
  MdPeople, 
  MdInventory, 
  MdEmail, 
  MdBarChart
} from 'react-icons/md';
import type { IconType } from 'react-icons';
import { OrderStatus } from '@prisma/client';
  
export type AdminNavigation = {
  name: string
  href: string
  icon: IconType
}
  
export const AdminLinks: AdminNavigation[] = [
  {
    name: "Orders",
    href: "/admin/orders",
    icon: MdShoppingCart,
  },
  {
    name: "Payments",
    href: "/admin/payments",
    icon: MdPayments,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: MdPeople,
  },
  {
    name: "Inventory",
    href: "/admin/inventory",
    icon: MdInventory,
  },
  {
    name: "Messages",
    href: "/admin/messages",
    icon: MdEmail,
  },
  {
    name: "Insights",
    href: "/admin/insights",
    icon: MdBarChart,
  },
];

export const ADMIN_TABS = [
  { value: null, label: 'All' },
  { value: OrderStatus.PENDING, label: 'Pending' },
  { value: OrderStatus.PROCESSING, label: 'Processing' },
  { value: OrderStatus.READY, label: 'Ready To Pickup' },
  { value: OrderStatus.CANCELLED, label: 'Canceled' },
  { value: OrderStatus.DELIVERED, label: 'Unpaid' },
];
