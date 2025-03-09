'use client';

import { useState } from "react";
import { useDebounce } from "use-debounce";
import { TicketList } from "./ticket-list";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTicketsQuery } from "@/hooks/tickets.hooks";
import { useUserStore } from "@/stores/user.store";

export default function TicketsContent() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebounce(searchInput, 500);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [assignedToFilter, setAssignedToFilter] = useState("ALL");
  const { userId } = useUserStore();

  const { data: tickets, isLoading, refetch } = useTicketsQuery({
    where: {
      ...(statusFilter !== "ALL" && { status: statusFilter }),
      ...(priorityFilter !== "ALL" && { priority: priorityFilter }),
      ...(assignedToFilter !== "ALL" && { assignedToId: assignedToFilter }),
      ...(debouncedSearch && {
        OR: [
          { title: { contains: debouncedSearch, mode: 'insensitive' } },
          { description: { contains: debouncedSearch, mode: 'insensitive' } }
        ]
      })
    },
    include: {
      createdBy: true,
      assignedTo: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex-1">
            <Input
              placeholder="Search tickets..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>

            <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Staff</SelectItem>
                <SelectItem value={userId as string}>Assigned to Me</SelectItem>
                <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <ScrollArea className="h-[calc(100vh-280px)]">
          <TicketList 
            tickets={tickets?.data || []} 
            isLoading={isLoading}
            refetch={refetch}
          />
        </ScrollArea>
      </Card>
    </div>
  );
}