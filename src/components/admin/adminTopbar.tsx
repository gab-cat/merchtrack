import { usePathname } from 'next/navigation';

export default function AdminTopBar() {
  const pathname = usePathname();


  // Determine the title based on the current route
  let pageTitle = '';

  switch (pathname) {
  case '/orders':
    pageTitle = 'Orders';
    break;
  case '/payments':
    pageTitle = 'Payments';
    break;
  case '/users':
    pageTitle = 'Users';
    break;
  case '/inventory':
    pageTitle = 'Inventory';
    break;
  case '/messages':
    pageTitle = 'Messages';
    break;
  case '/insights':
    pageTitle = 'Insights';
    break;
  default:
    pageTitle = 'Admin Dashboard'; 
  }

  return (
    <div className="admin-topbar">
      <h1>{pageTitle}</h1>
    </div>
  );
}
