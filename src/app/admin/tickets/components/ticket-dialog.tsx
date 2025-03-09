'use client';

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { TicketPriority, TicketStatus } from "@prisma/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExtendedTicket } from "@/types/tickets";
import { useUserStore } from "@/stores/user.store";
import { addTicketUpdate, updateTicket } from "@/actions/ticket.actions";
import { prettyFormatDate } from "@/utils";

interface TicketDialogProps {
  ticket: ExtendedTicket | null;
  onClose: () => void;
  refetch: () => void;
}

const getStatusBadgeClasses = (status: string) => {
  switch (status) {
  case 'CLOSED':
    return 'border-red-200 bg-red-50 text-red-700';
  case 'RESOLVED':
    return 'border-green-200 bg-green-50 text-green-700';
  case 'IN_PROGRESS':
    return 'border-yellow-200 bg-yellow-50 text-yellow-700';
  case 'OPEN':
    return 'border-primary bg-primary-100 text-primary';
  default:
    return 'border-gray-200 bg-gray-50 text-gray-700';
  }
};

export function TicketDialog({ ticket, onClose, refetch }: Readonly<TicketDialogProps>) {
  const [updateMessage, setUpdateMessage] = useState("");
  const [newStatus, setNewStatus] = useState<TicketStatus>("OPEN");
  const [newPriority, setNewPriority] = useState<TicketPriority>("MEDIUM");
  const { userId, user } = useUserStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (ticket) {
      setNewStatus(ticket.status);
      setNewPriority(ticket.priority);
    }
  }, [ticket]);

  const { mutate: updateTicketMutation, isPending: isUpdating } = useMutation({
    mutationKey: ['tickets:all'],
    mutationFn: (data: { ticketId: string; status: string; message: string }) =>
      addTicketUpdate({
        ticketId: data.ticketId,
        status: data.status as TicketStatus,
        message: data.message,
        assignedToId: userId as string,
        createdBy: user ? `${user.firstName} ${user.lastName}` : userId as string,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets:all'] });
      setUpdateMessage("");
      toast.success("Ticket updated successfully");
      refetch();
    },
    onError: () => {
      toast.error("Failed to update ticket");
    },
  });

  const { mutate: updatePriorityMutation } = useMutation({
    mutationKey: ['tickets:all', ],
    mutationFn: (data: { ticketId: string; priority: string }) =>
      updateTicket({
        ticketId: data.ticketId,
        priority: data.priority as TicketPriority,
      }),
    onSuccess: () => {
      toast.success("Priority updated successfully");
      refetch();
    },
    onError: () => {
      toast.error("Failed to update priority");
    },
  });

  const handleSubmitUpdate = () => {
    if (!ticket || !updateMessage.trim()) return;

    updateTicketMutation({
      ticketId: ticket.id,
      status: newStatus,
      message: updateMessage,
    });
  };

  const handlePriorityChange = (priority: string) => {
    if (!ticket) return;

    setNewPriority(priority as TicketPriority);
    updatePriorityMutation({
      ticketId: ticket.id,
      priority,
    });
  };

  if (!ticket) return null;

  let ticketUpdates: TicketUpdate[] = [];
  if (Array.isArray(ticket.updates)) {
    ticketUpdates = ticket.updates;
  } else if (ticket.updates) {
    try {
      ticketUpdates = JSON.parse(ticket.updates as string);
    } catch {
      ticketUpdates = [];
    }
  }

  return (
    <Dialog open={!!ticket} onOpenChange={() => onClose()}>
      <DialogTitle>Ticket Details</DialogTitle>
      <DialogContent className="max-h-[85vh] max-w-[90vw] overflow-auto bg-neutral-1 p-0">
        <div className="flex h-full divide-x divide-gray-200">
          {/* Left Panel - Ticket Details */}
          <div className="flex h-full w-1/2 flex-col overflow-auto p-6">
            {/* Header Section */}
            <div className="flex-none">
              <h2 className="mb-6 text-2xl font-bold text-primary">
                {ticket.title}
              </h2>

              {/* Controls */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status-select" className="mb-1 block text-sm font-medium text-neutral-7">Status</label>
                  <Select name="status-select" value={newStatus} onValueChange={(value) => setNewStatus(value as TicketStatus)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="priority-select" className="mb-1 block text-sm font-medium text-neutral-7">Priority</label>
                  <Select name="priority-select" value={newPriority} onValueChange={handlePriorityChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Scrollable Details Section */}
            <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex-none border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-7">Created by</p>
                    <p className="text-lg font-medium text-primary">{ticket.createdBy.firstName} {ticket.createdBy.lastName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-7">Created on</p>
                    <p className="text-lg font-medium text-primary">{format(new Date(ticket.createdAt), "MMM d, yyyy")}</p>
                    <p className="text-sm text-gray-500">{format(new Date(ticket.createdAt), "h:mm a")}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex-1 overflow-y-auto">
                <h3 className="mb-2 text-sm font-medium text-gray-500">Description</h3>
                <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-700">
                  {ticket.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel - Updates */}
          <div className="flex h-full w-1/2 flex-col overflow-hidden p-6">
            <h3 className="mb-4 flex-none text-lg font-semibold text-primary">Updates</h3>
            
            {/* Scrollable Updates List */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4 pr-2">
                {ticketUpdates.map((update: TicketUpdate) => (
                  <div 
                    key={`${update.createdAt}-${update.status}`} 
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-none transition-all hover:shadow-sm"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="space-x-2">
                        <Badge 
                          variant="outline" 
                          className={getStatusBadgeClasses(update.status)}
                        >
                          {update.status}
                        </Badge>
                        <span className="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-700">{update.createdBy}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {prettyFormatDate(update.createdAt!)}
                      </span>
                    </div>
                    <p className="text-base text-gray-700">{update.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Update Form */}
            <div className="mt-4 flex-none border-t border-gray-200 pt-4">
              <Textarea
                placeholder="Add an update or response..."
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                className="mb-4 min-h-[120px] bg-white"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitUpdate}
                  disabled={!updateMessage.trim() || isUpdating}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isUpdating ? "Updating..." : "Add Update"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}