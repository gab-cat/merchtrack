'use client';

import { useState } from "react";
import { format } from "date-fns";
import { TicketDialog } from "./ticket-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExtendedTicket } from "@/types/tickets";

interface TicketListProps {
  tickets: ExtendedTicket[];
  isLoading: boolean;
  refetch: () => void;
}

export function TicketList({ tickets, isLoading, refetch }: Readonly<TicketListProps>) {
  const [selectedTicket, setSelectedTicket] = useState<ExtendedTicket | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
    case 'OPEN':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'RESOLVED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'CLOSED':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case 'HIGH':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'MEDIUM':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'LOW':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!tickets.length) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold text-gray-900">No tickets found</p>
        <p className="text-sm text-gray-500">No support tickets match your filters</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <button
            key={ticket.id}
            className="w-full cursor-pointer rounded-lg border bg-white p-4 transition-all hover:border-primary/20 hover:shadow-md"
            onClick={() => setSelectedTicket(ticket)}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-primary">{ticket.title}</h3>
              <div className="flex gap-2">
                <Badge variant="outline" className={getStatusColor(ticket.status)}>
                  {ticket.status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                  {ticket.priority}
                </Badge>
              </div>
            </div>
            
            <p className="mt-2 line-clamp-2 text-left text-sm text-gray-600">{ticket.description}</p>
            
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>From: {ticket.createdBy.firstName} {ticket.createdBy.lastName}</span>
                {ticket.assignedTo && (
                  <span>Assigned to: {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}</span>
                )}
              </div>
              <span>{format(new Date(ticket.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
            </div>
          </button>
        ))}
      </div>

      <TicketDialog
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        refetch={refetch}
      />
    </>
  );
}