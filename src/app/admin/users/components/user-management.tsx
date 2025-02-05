"use client";

import { useState, useCallback } from "react";
import { FaUserPlus } from "react-icons/fa";
import { SearchBar } from "./search-bar";
import { UserList } from "./user-list";
import { Button } from "@/components/ui/button";
import { users as initialUsers } from "@/types/users";

export function UserManagement() {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleDeleteUser = useCallback((userId: string) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
  }, []);

  const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-blue-600">{users.length} users</span>
        <div className="flex items-center gap-4">
          <SearchBar onSearch={handleSearch} />
          <Button className="bg-blue-600 hover:bg-blue-700">
            <FaUserPlus className="mr-2 size-4" />
            Add member
          </Button>
        </div>
      </div>
      <UserList users={filteredUsers} onDeleteUser={handleDeleteUser} />
    </div>
  );
}

