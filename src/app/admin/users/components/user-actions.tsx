"use client";

import { useState } from "react";
import { 
  FaTrash, 
  FaUserShield, 
  FaBan, 
  FaUnlock, 
  FaExclamationTriangle 
} from "react-icons/fa";
import { UserManagerDialog } from "./user-manager-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import { useUserQuery } from "@/hooks/users.hooks";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface UserActionsProps {
  email: string;
}

export function UserActions({ email }: UserActionsProps) {
  const { data: user, isLoading } = useUserQuery(decodeURIComponent(email));
  const [isManagerDialogOpen, setIsManagerDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);

  if (isLoading) {
    return <UserActionsSkeleton />;
  }

  if (!user) {
    return null;
  }

  const handleDeleteUser = async () => {
    // TODO: Implement user deletion
    console.log('Delete user:', user.id);
  };

  const handleDeactivateUser = async () => {
    // TODO: Implement user deactivation
    console.log('Deactivate user:', user.id);
  };

  return (
    <>
      <Card className="overflow-hidden border-none shadow-md">
        <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-blue-500 pb-3">
          <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          <p className="text-sm text-blue-100">
            Manage user account settings and access
          </p>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          <Button
            variant="outline"
            className="w-full justify-start border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
            onClick={() => setIsManagerDialogOpen(true)}
          >
            <FaUserShield className="mr-2 size-4" />
            Manage User Manager
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start border-yellow-100 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700"
            onClick={handleDeactivateUser}
          >
            <FaBan className="mr-2 size-4" />
            {user.isDeleted ? 'Reactivate Account' : 'Deactivate Account'}
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start border-purple-100 bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700"
            onClick={() => setIsResetPasswordDialogOpen(true)}
          >
            <FaUnlock className="mr-2 size-4" />
            Reset Password
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start border-red-100 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
              >
                <FaTrash className="mr-2 size-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-red-100 bg-neutral-2">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                  <FaExclamationTriangle className="size-5" />
                  Delete User Account
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-2 text-gray-600">
                  <div>
                    Are you sure you want to delete this user account? This action is permanent and cannot be undone.
                  </div>
                  <div className="rounded-md bg-red-50 p-3 text-sm">
                    <p className="font-medium text-red-800">Warning:</p>
                    <p className="mt-1 text-red-700">
                      All associated data including orders, payments, and activity logs will be permanently removed.
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteUser}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <UserManagerDialog
        open={isManagerDialogOpen}
        onOpenChange={setIsManagerDialogOpen}
        userId={user.id}
        currentManagerId={user.managerId}
      />
      <ResetPasswordDialog
        open={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
        userId={user.clerkId}
        email={user.email}
      />
    </>
  );
}

function UserActionsSkeleton() {
  return (
    <Card className="overflow-hidden border-none shadow-md">
      <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-blue-500">
        <Skeleton className="h-6 w-32 bg-white/20" />
        <Skeleton className="mt-1 h-4 w-48 bg-white/20" />
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}