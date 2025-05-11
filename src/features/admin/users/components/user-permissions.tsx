"use client";

import { useState } from "react";
import { UserPermission } from "@prisma/client";
import { AlertCircle, Shield, ShieldCheck, ShieldAlert, ShieldOff } from "lucide-react";
import { toast } from "sonner";


import { FaSave } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import { useUserQuery } from "@/hooks/users.hooks";
import { updateUserPermissions } from "@/features/admin/users/actions/updateUserPermissions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useUserStore } from "@/stores/user.store";

interface UserPermissionsProps {
  email: string;
}

type ActionCode = 'logs' | 'reports' | 'profile' | 'users' | 'orders' | 'payments' | 'inventory' | 'dashboard' | 'settings' | 'messages';

const PERMISSIONS: { code: ActionCode; title: string }[] = [
  { code: 'logs', title: 'Activity Logs' },
  { code: 'reports', title: 'Reports' },
  { code: 'profile', title: 'Profile Management' },
  { code: 'users', title: 'User Management' },
  { code: 'orders', title: 'Order Management' },
  { code: 'payments', title: 'Payment Management' },
  { code: 'inventory', title: 'Inventory Management' },
  { code: 'dashboard', title: 'Dashboard Access' },
  { code: 'settings', title: 'System Settings' },
  { code: 'messages', title: 'Messaging' }
];

type PermissionLevel = 'none' | 'read' | 'write' | 'full';

const getAccessLevelIcon = (level: PermissionLevel) => {
  switch (level) {
  case 'full':
    return <ShieldCheck className="size-4 text-green-600" />;
  case 'write':
    return <Shield className="size-4 text-blue-600" />;
  case 'read':
    return <ShieldAlert className="size-4 text-yellow-600" />;
  default:
    return <ShieldOff className="size-4 text-gray-400" />;
  }
};

const getAccessLevelStyle = (level: PermissionLevel) => {
  switch (level) {
  case 'full':
    return "bg-green-50 text-green-700 hover:bg-green-100 data-[state=open]:bg-green-100";
  case 'write':
    return "bg-blue-50 text-blue-700 hover:bg-blue-100 data-[state=open]:bg-blue-100";
  case 'read':
    return "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 data-[state=open]:bg-yellow-100";
  default:
    return "bg-gray-50 text-gray-700 hover:bg-gray-100 data-[state=open]:bg-gray-100";
  }
};

export function UserPermissions({ email }: UserPermissionsProps) {
  const { data: user, isLoading, refetch } = useUserQuery(decodeURIComponent(email));
  const { userId: currentUserId } = useUserStore();
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, PermissionLevel>>({});

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user || !currentUserId) throw new Error("User or current user ID is missing");
    
      const permissionUpdates: Record<string, Partial<UserPermission>> = {};
      Object.entries(selectedPermissions).forEach(([code, level]) => {
        permissionUpdates[code] = {
          canCreate: level === 'write' || level === 'full',
          canRead: level !== 'none',
          canUpdate: level === 'write' || level === 'full',
          canDelete: level === 'full'
        };
      });
    
      const result = await updateUserPermissions({
        userId: user.id,
        currentUserId: currentUserId,
        permissions: permissionUpdates
      });
      return { success: result.success, message: result.message };
    },
    mutationKey: [`users:${user?.email}`],
    onSuccess: (result: { success: boolean; message: string | undefined; }) => {
      if (!result.success) {
        throw new Error(result.message);
      }
      toast.success("User permissions updated successfully");
      setSelectedPermissions({});
      refetch();
    },
    onError: (error: Error) => {
      toast.error((error as Error).message || "Failed to update permissions");
    }
  }
  );

  if (isLoading) {
    return <PermissionsSkeleton />;
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Could not load user permissions. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const handlePermissionChange = (code: string, level: PermissionLevel) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [code]: level
    }));
  };

  const handleSubmit = () => {
    mutation.mutate();
  };

  const getCurrentLevel = (permission: UserPermission): PermissionLevel => {
    if (permission.canDelete) return 'full';
    if (permission.canCreate || permission.canUpdate) return 'write';
    if (permission.canRead) return 'read';
    return 'none';
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none shadow-md">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Shield className="size-5" />
            User Permissions
          </h3>
          <p className="mt-1 text-sm text-blue-100">
            Manage user access levels and permissions for different system features
          </p>
        </div>
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="font-bold text-primary hover:bg-transparent">
                <TableHead className="w-[300px] font-bold">Permission</TableHead>
                <TableHead className="font-bold">Code</TableHead>
                <TableHead className="font-bold">Access Level</TableHead>
                <TableHead className="font-bold">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PERMISSIONS.map((perm) => {
                const userPermission = user.userPermissions?.find(
                  up => up.permissionId === perm.code
                );
                const currentLevel = userPermission 
                  ? getCurrentLevel(userPermission)
                  : 'none';

                return (
                  <TableRow key={perm.code} className="group">
                    <TableCell>
                      <Label className="font-medium text-primary-500">{perm.title}</Label>
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>{perm.code}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={selectedPermissions[perm.code] || currentLevel}
                        onValueChange={(value: PermissionLevel) => 
                          handlePermissionChange(perm.code, value)
                        }
                      >
                        <SelectTrigger className={`w-[180px] ${getAccessLevelStyle(selectedPermissions[perm.code] || currentLevel)}`}>
                          <div className="flex items-center gap-2">
                            {getAccessLevelIcon(selectedPermissions[perm.code] || currentLevel)}
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" className="flex items-center gap-2">
                            No Access
                          </SelectItem>
                          <SelectItem value="read" className="flex items-center gap-2">
                            Read Only
                          </SelectItem>
                          <SelectItem value="write" className="flex items-center gap-2">
                            Read & Write
                          </SelectItem>
                          <SelectItem value="full" className="flex items-center gap-2">
                            Full Access
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {getPermissionDescription(perm.code)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="mt-6 flex justify-end border-t pt-4">
            <Button 
              onClick={handleSubmit}
              disabled={mutation.isPending || Object.keys(selectedPermissions).length === 0}
              className="bg-blue-600 text-neutral-2 hover:bg-blue-700"
            >
              <FaSave className="mr-2 text-neutral-2"/> {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function getPermissionDescription(code: ActionCode): string {
  const descriptions: Record<ActionCode, string> = {
    logs: "View and manage system activity logs",
    reports: "Access and generate system reports",
    profile: "Manage user profile information",
    users: "Manage user accounts and permissions",
    orders: "View and manage customer orders",
    payments: "Process and manage payments",
    inventory: "Manage product inventory",
    dashboard: "Access system dashboard and analytics",
    settings: "Configure system settings",
    messages: "Send and receive system messages"
  };
  return descriptions[code];
}

function PermissionsSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <div className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-[300px] animate-pulse rounded-md bg-gray-200" />
                <div className="h-10 w-[180px] animate-pulse rounded-md bg-gray-200" />
                <div className="h-10 w-[300px] animate-pulse rounded-md bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}