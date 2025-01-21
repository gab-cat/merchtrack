import { ShieldAlert, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageAnimation from "@/components/public/page-animation";

export default function PermissionDenied() {
  return (
    <PageAnimation>
      <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 font-inter antialiased sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <ShieldAlert className="mx-auto size-12 text-yellow-400" />
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Permission Denied</h2>
              <p className="mt-2 text-center text-sm text-gray-600">
              You do not have the required permissions to access this page.
              </p>
            </div>

            <div className="mt-8">
              <div className="rounded-md bg-yellow-50 p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <ShieldAlert className="size-5 text-yellow-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Access Restricted</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                      To gain access, please reach out to your manager. They will be able to grant you the necessary
                      permissions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <Mail className="mr-2 size-4" /> Contact Manager
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageAnimation>
  );
}

