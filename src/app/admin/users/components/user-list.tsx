import { User } from "@prisma/client";
import { FaUser } from "react-icons/fa";
import { motion } from "framer-motion";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { UserRow } from "./user-row";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeInUp } from "@/constants/animations";

interface UserListProps {
  users: User[];
  isLoading: boolean;
  onManageUser: (userId: string) => void;
}

function UserSkeleton() {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-4">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-[150px]" />
            <Skeleton className="h-3 w-[100px]" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="size-8 rounded-md" />
      </div>
    </div>
  );
}

export function UserList({ users = [], isLoading, onManageUser }: UserListProps) {
  const [parent] = useAutoAnimate();
  if (isLoading) {
    return (
      <Card className="divide-y divide-gray-200">
        {Array.from({ length: 10 }).map((_, index) => (
          <UserSkeleton key={index} />
        ))}
      </Card>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center space-y-4 text-gray-400">
          <FaUser className="size-8" />
          <p>No users found</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div {...fadeInUp} className="rounded-xl bg-white shadow-sm">
      <div ref={parent} className="divide-y divide-gray-200">
        {users.map((user) => (
          <UserRow 
            key={user.id} 
            user={user} 
            onManageUser={onManageUser}
          />
        ))}
      </div>
    </motion.div>
  );
}

