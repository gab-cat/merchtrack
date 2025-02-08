import { UserRow } from "./user-row";
import type { UserData } from "@/types/users";

interface UserListProps {
  users: UserData[]
  onDeleteUser: (userId: string) => void
}

export function UserList({ users, onDeleteUser }: UserListProps) {
  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="divide-y divide-gray-200">
        {users.map((user) => (
          <UserRow key={user.id} user={user} onDelete={onDeleteUser} />
        ))}
      </div>
    </div>
  );
}

