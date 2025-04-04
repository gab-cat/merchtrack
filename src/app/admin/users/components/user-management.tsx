"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Role } from "@prisma/client";
import { useDebounce } from 'use-debounce';
import { useRouter } from "next/navigation";
import { SearchBar } from "./search-bar";
import { UserList } from "./user-list";
import { useUsersQuery } from "@/hooks/users.hooks";
import { QueryParams } from "@/types/common";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { College } from "@/types/Misc";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationFooter } from "@/app/admin/survey/components/pagination-footer";

const ITEMS_PER_PAGE = 10;

function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-between px-2">
      <Skeleton className="h-4 w-[200px]" />
      <div className="flex items-center gap-2">
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="size-8 rounded-md" />
      </div>
    </div>
  );
}

export function UserManagement() {
  const COLLEGE_OPTIONS = useMemo(() => Object.values(College), []);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 1000);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('desc');
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedCollege, setSelectedCollege] = useState<string>("ALL");
  const router = useRouter();


  const handleSortChange = (value: string) => {
    setSortBy(value as 'asc' | 'desc');
  };

  const queryParams = useMemo(() => {
    const params: QueryParams = {
      limit: ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      page: currentPage,
      orderBy: {
        createdAt: sortBy
      },
      where: {
        isDeleted: false
      }
    };

    if (debouncedSearch) {
      params.where = {
        ...params.where,
        OR: [
          { firstName: { contains: debouncedSearch, mode: 'insensitive' } },
          { lastName: { contains: debouncedSearch, mode: 'insensitive' } },
          { email: { contains: debouncedSearch, mode: 'insensitive' } }
        ]
      };
    }

    if (selectedRole && selectedRole !== "ALL") {
      params.where = {
        ...params.where,
        role: selectedRole as Role
      };
    }

    if (selectedCollege && selectedCollege !== "ALL") {
      params.where = {
        ...params.where,
        college: selectedCollege
      };
    }

    return params;
  }, [currentPage, debouncedSearch, sortBy, selectedRole, selectedCollege]);

  const { data: usersData, isLoading } = useUsersQuery(queryParams);

  useEffect(() => {
    if (currentPage > (usersData?.metadata?.lastPage ?? 1)) {
      setCurrentPage(1);
    }
  }, [currentPage, usersData?.metadata?.lastPage]);

  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

  const handleManageUser = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full space-y-4">
      <div className="mb-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-blue-600">
            {usersData?.metadata?.total ?? 0} users
          </span>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="STAFF_FACULTY">Staff/Faculty</SelectItem>
              <SelectItem value="STUDENT">Student</SelectItem>
              <SelectItem value="PLAYER">Player</SelectItem>
              <SelectItem value="ALUMNI">Alumni</SelectItem>
              <SelectItem value="OTHERS">Others</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCollege} onValueChange={setSelectedCollege}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filter by college" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Colleges</SelectItem>
              {COLLEGE_OPTIONS.map((college) => (
                <SelectItem key={college} value={college}>
                  {college}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {isLoading ? (
        <UserList users={[]} isLoading={true} onManageUser={handleManageUser} />
      ) : (
        <UserList 
          users={usersData?.data ?? []} 
          isLoading={false}
          onManageUser={handleManageUser} 
        />
      )}

      {isLoading ? (
        <PaginationSkeleton />
      ) : (
        usersData?.metadata && usersData.metadata.total > 0 && (
          <div className="flex items-center justify-between px-2">
            <PaginationFooter 
              currentPage={currentPage} 
              totalPages={usersData.metadata.lastPage}
              totalItems={usersData.metadata.total} 
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          </div>
        )
      )}
    </div>
  );
}

