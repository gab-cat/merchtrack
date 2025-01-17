import Image from "next/image";
import Link from 'next/link';
import 'flowbite';

const AdminSidebar: React.FC = () => {
  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        data-drawer-target="default-sidebar"
        data-drawer-toggle="default-sidebar"
        aria-controls="default-sidebar"
        type="button"
        className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
      >
        <span className="sr-only">Open sidebar</span>
        <svg
          aria-hidden="true"
          className="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M2 4.5A1.5 1.5 0 013.5 3h13a1.5 1.5 0 110 3h-13A1.5 1.5 0 012 4.5zM3.5 9a1.5 1.5 0 100 3h13a1.5 1.5 0 100-3h-13zm0 6a1.5 1.5 0 100 3h13a1.5 1.5 0 100-3h-13z"
          ></path>
        </svg>
      </button>

      {/* Sidebar Container */}
      <aside
        id="default-sidebar"
        className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
        aria-label="Sidebar"
      >
        {/* Sidebar Content */}
        <div className="h-full px-4 py-6 bg-white border border-gray-200 flex flex-col justify-between">
          {/* Top Section: Logo and Title */}
          <div>
            <div className="flex items-center justify-center mb-8">
              {/* Logo */}
              <Image
                src="/img/logo.png" // Replace with your logo path
                alt="MerchTrack Logo"
                width={48}
                height={48}
                className="rounded-md"
              />
            </div>
            <h1 className="text-center text-xl font-semibold text-gray-700 dark:text-white">
              MerchTrack
            </h1>
          </div>

          {/* Middle Section: Navigation Items */}
          <ul className="space-y-6 mt-8 px-4">
            {/*Orders */}
            <li>
              <Link
                href="/orders" // Set the appropriate route path here
                className="flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 4h18M3 10h18M10 16h11M4 16h.01M6 20h.01M8 20h8" />
                </svg>
                <span className="ms-3">Orders</span>
              </Link>
            </li>
            {/* Payments*/}
            <li>
              <Link
                href="/payments" // Set the appropriate route path here
                className="flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 4h18M3 10h18M10 16h11M4 16h.01M6 20h.01M8 20h8" />
                </svg>
                <span className="ms-3">Payments</span>
              </Link>
            </li>
            {/* Users*/}
            <li>
              <Link
                href="/users" // Set the appropriate route path here
                className="flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 4h18M3 10h18M10 16h11M4 16h.01M6 20h.01M8 20h8" />
                </svg>
                <span className="ms-3">Users</span>
              </Link>
            </li>
            {/* Inventory*/}
            <li>
              <Link
                href="/inventory" // Set the appropriate route path here
                className="flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 4h18M3 10h18M10 16h11M4 16h.01M6 20h.01M8 20h8" />
                </svg>
                <span className="ms-3">Inventory</span>
              </Link>
            </li>
            {/* Messages*/}
            <li>
              <Link
                href="/messages" // Set the appropriate route path here
                className="flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 4h18M3 10h18M10 16h11M4 16h.01M6 20h.01M8 20h8" />
                </svg>
                <span className="ms-3">Messages</span>
              </Link>
            </li>
            {/* Insights*/}
            <li>
              <Link
                href="/insights" // Set the appropriate route path here
                className="flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 4h18M3 10h18M10 16h11M4 16h.01M6 20h.01M8 20h8" />
                </svg>
                <span className="ms-3">Insights</span>
              </Link>
            </li>
          </ul>


          {/* Bottom Section: Profile and Logout */}
          <div className="mt-auto px-4">
            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <Image
                src="/img/sample_pfp.jpg" 
                alt="User Avatar"
                width={40} 
                height={40} 
                className="rounded-full shadow-sm"
              />
              <span className="text-gray-700 dark:text-white">Kyla Ronquillo</span>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              className="flex items-center w-full mt-6 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21l-6-6 6-6" />
                <path d="M3 12h12" />
              </svg>
              <span className="ms-3">Log Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
