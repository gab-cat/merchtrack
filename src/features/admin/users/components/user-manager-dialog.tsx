'use client';

import { useState } from "react";
import { FaSearch, FaUserShield } from "react-icons/fa";
import { Shield } from "lucide-react";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStaffMembersQuery, useUserQuery } from "@/hooks/users.hooks";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { assignManager } from "@/features/admin/users/actions/assignManager";

interface UserManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentManagerId: string | null;
}

export function UserManagerDialog({
  open,
  onOpenChange,
  userId,
  currentManagerId
}: UserManagerDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const { data: currentManager } = useUserQuery(
    currentManagerId || "",
    currentManagerId ? undefined : ["id", "firstName", "lastName", "email"]
  );

  // Fetch staff members with search filter
  const { data: staffData, isLoading: isLoadingStaff } = useStaffMembersQuery({
    where: debouncedSearch ? {
      OR: [
        { firstName: { contains: debouncedSearch, mode: 'insensitive' } },
        { lastName: { contains: debouncedSearch, mode: 'insensitive' } },
        { email: { contains: debouncedSearch, mode: 'insensitive' } }
      ]
    } : undefined
  });

  const handleAssignManager = async (managerId: string) => {
    try {
      const result = await assignManager({ userId, managerId });
      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to assign manager");
    }
  };

  const handleRemoveManager = async () => {
    try {
      const result = await assignManager({ userId, managerId: "" }); // Empty string to remove manager
      if (result.success) {
        toast.success("Manager removed successfully");
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to remove manager");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-2 sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 border-b pb-4">
            <div className="rounded-full bg-blue-100 p-2 text-blue-600">
              <Shield className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Manage User Manager</DialogTitle>
              <p className="mt-1 text-sm text-gray-500">
                Assign or change the manager responsible for this user
              </p>
            </div>
          </div>
        </DialogHeader>

        {currentManager && (
          <div className="mb-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
              <FaUserShield className="size-4" />
              Current Manager
            </p>
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="size-12 border-2 border-white shadow-sm">
                    <AvatarFallback className="bg-blue-600 text-lg text-white">
                      {currentManager.firstName?.[0]}
                      {currentManager.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {currentManager.firstName} {currentManager.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{currentManager.email}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveManager}
                    className="shrink-0"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search staff members by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[300px] rounded-md border p-4">
            {isLoadingStaff ? (
              <ManagerListSkeleton />
            ) : (
              <div className="space-y-3">
                {staffData?.data?.map((staff) => (
                  <Card key={staff.id} className="transition-colors hover:bg-gray-50">
                    <div className="p-3">
                      <div className="flex items-center gap-4">
                        <Avatar className="border shadow-sm">
                          <AvatarFallback className="bg-blue-600 text-white">
                            {staff?.firstName?.[0]}
                            {staff?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {staff.firstName} {staff.lastName}
                            </p>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                              <FaUserShield className="mr-1 size-3" />
                              Staff
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">{staff.email}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignManager(staff.id)}
                          className="shrink-0"
                          disabled={staff.id === currentManagerId}
                        >
                          {staff.id === currentManagerId ? 'Current' : 'Assign'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {staffData?.data?.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <FaUserShield className="mb-2 size-8" />
                    <p>No staff members found</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ManagerListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="mb-1 h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-9 w-16" />
          </div>
        </Card>
      ))}
    </div>
  );
}