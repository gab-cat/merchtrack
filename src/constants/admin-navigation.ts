import { 
  MdShoppingCart, 
  MdPayments, 
  MdPeople, 
  MdInventory, 
  MdEmail, 
  MdBarChart
} from 'react-icons/md';
import { IconType } from 'react-icons';
  
export interface AdminNavigation {
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

