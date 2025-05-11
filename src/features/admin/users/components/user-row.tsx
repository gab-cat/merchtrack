import { FaEllipsisH, FaEnvelope, FaGraduationCap, FaCircle } from "react-icons/fa";
import { User, Role } from "@prisma/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserImageQuery } from "@/hooks/messages.hooks";

interface UserRowProps {
  user: User;
  onManageUser: (email: string) => Promise<void> | void;
}

export function UserRow({ user, onManageUser }: UserRowProps) {
  const { data: userImage } = useUserImageQuery(user.clerkId);

  const getRoleBadgeStyles = (role: Role) => {
    switch (role) {
    case 'STAFF_FACULTY':
      return 'bg-blue-100 text-blue-800';
    case 'STUDENT':
      return 'bg-green-100 text-green-800';
    case 'PLAYER':
      return 'bg-purple-100 text-purple-800';
    case 'ALUMNI':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
      <div className="flex items-center gap-4">
        <Avatar className="size-10 border shadow-sm">
          {userImage ? (
            <AvatarImage src={userImage} alt={`${user.firstName}'s avatar`} />
          ) : (
            <AvatarFallback className="bg-blue-600 text-lg text-white">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </p>
            <Badge variant="secondary" className={`${getRoleBadgeStyles(user.role)}`}>
              {user.role}
            </Badge>
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
            <FaEnvelope className="size-3" />
            <span>{user.email}</span>
            {user.college && (
              <>
                <span>•</span>
                <FaGraduationCap className="size-3" />
                <span>{user.college}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">    
        <Badge variant="outline" className="flex items-center gap-1">
          <FaCircle className={`size-2 ${user.isDeleted ? 'text-red-500' : 'text-green-500'}`} />
          {user.isDeleted ? 'Inactive' : 'Active'}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onManageUser(user.email)}
          className="hover:bg-gray-100"
        >
          <FaEllipsisH className="size-4 text-gray-500" />
        </Button>
      </div>
    </div>
  );
}

