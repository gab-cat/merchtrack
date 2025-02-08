import { useState, useCallback } from "react";
import { FaUser, FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Role } from "@/types/Misc";
import type { UserData } from "@/types/users";
import { cn } from "@/lib/utils";

interface UserRowProps {
  user: UserData
  onDelete: (userId: string) => void
}

export function UserRow({ user, onDelete }: UserRowProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleRoleChange = useCallback(
    (value: string) => {
      console.log(`Changing role for ${user.name} to ${value}`);
    },
    [user.name],
  );

  const handleDelete = useCallback(() => {
    onDelete(user.id);
    setIsDeleteDialogOpen(false);
  }, [user.id, onDelete]);

  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-gray-200">
          <FaUser className="size-5 text-gray-500" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs font-medium",
            user.role === Role.STUDENT && "bg-blue-100 text-blue-800",
            user.role === Role.STAFF_FACULTY && "bg-purple-100 text-purple-800",
            user.role === Role.OTHERS && "bg-orange-100 text-orange-800",
            user.role === Role.PLAYER && "bg-green-100 text-green-800",
            user.role === Role.ALUMNI && "bg-red-100 text-red-800",
          )}
        >
          {user.role === Role.STAFF_FACULTY ? "Teacher" : `Student (${user.college})`}
        </span>
        <Select defaultValue={user.type} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[110px] border-0 bg-gray-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
              <FaTrash className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {user.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

