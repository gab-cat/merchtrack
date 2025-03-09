'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  MessageSquare, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  RefreshCw
} from 'lucide-react';
import SupportModal from './support-modal';
import { useTicketsQuery } from '@/hooks/tickets.hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

export default function MyTickets() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  
  const { data: ticketsData, isLoading, refetch } = useTicketsQuery({
    page: currentPage,
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  
  const tickets = ticketsData?.data || [];
  const pagination = ticketsData?.metadata;
  
  const getStatusBadge = (status: string) => {
    switch (status) {
    case 'OPEN':
      return <Badge variant="outline" className="border-blue-200 bg-blue-100 text-blue-800"><AlertCircle className="mr-1 size-3" /> Open</Badge>;
    case 'IN_PROGRESS':
      return <Badge variant="outline" className="border-yellow-200 bg-yellow-100 text-yellow-800"><Clock className="mr-1 size-3" /> In Progress</Badge>;
    case 'RESOLVED':
      return <Badge variant="outline" className="border-green-200 bg-green-100 text-green-800"><CheckCircle className="mr-1 size-3" /> Resolved</Badge>;
    case 'CLOSED':
      return <Badge variant="outline" className="border-gray-200 bg-gray-100 text-gray-800"><XCircle className="mr-1 size-3" /> Closed</Badge>;
    default:
      return <Badge variant="outline" className="border-gray-200 bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
    case 'LOW':
      return <Badge variant="outline" className="border-green-100 bg-green-50 text-green-700">Low</Badge>;
    case 'MEDIUM':
      return <Badge variant="outline" className="border-yellow-100 bg-yellow-50 text-yellow-700">Medium</Badge>;
    case 'HIGH':
      return <Badge variant="outline" className="border-red-100 bg-red-50 text-red-700">High</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
    }
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && (!pagination || newPage <= pagination.lastPage)) {
      setCurrentPage(newPage);
    }
  };
  
  const handleViewTicket = (ticketId: string) => {
    setSelectedTicket(ticketId);
    setIsDetailOpen(true);
  };

  const handleSupportModalOpen = () => {
    setIsDetailOpen(false);
    setIsSupportModalOpen(true);
  };

  const handleSupportModalClose = () => {
    setIsSupportModalOpen(false);
    refetch(); // Refresh tickets list after creating a new ticket
  };
  
  const selectedTicketData = tickets.find(ticket => ticket.id === selectedTicket);
  
  let updates: TicketUpdate[] = [];
  if (selectedTicketData?.updates) {
    try {
      updates = JSON.parse(selectedTicketData.updates as string);
    } catch (e) {
      console.error('Error parsing ticket updates:', e);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="mr-2 size-5 text-blue-600" />
              <div>
                <CardTitle className="text-xl font-bold text-gray-800">
                  Support Tickets
                </CardTitle>
                <CardDescription>
                  Track the status of your support requests
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                onClick={handleSupportModalOpen}
              >
                New Ticket
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="size-8 rounded-full"
                onClick={() => refetch()}
                title="Refresh tickets"
                disabled={isLoading}
              >
                <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="sr-only">Refresh</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-60 items-center justify-center">
              <Spinner size="lg" className="text-primary" />
              <span className="ml-2">Loading your tickets...</span>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex h-60 flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-6">
                <MessageSquare className="size-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No tickets found</h3>
              <p className="mt-2 max-w-md px-4 text-sm text-gray-600">
                You haven&apos;t submitted any support tickets yet.
              </p>
              <Button 
                variant="outline" 
                className="mt-4 border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={handleSupportModalOpen}
              >
                Create Support Ticket
              </Button>
            </div>
          ) : (
            <>
              {/* Table for larger screens */}
              <div className="hidden overflow-hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead className="max-w-[200px]">Title</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[100px]">Priority</TableHead>
                      <TableHead className="w-[100px]">Date</TableHead>
                      <TableHead className="w-[100px] text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono text-xs">
                          {ticket.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate font-medium">
                          {ticket.title}
                        </TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewTicket(ticket.id)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Cards for mobile view */}
              <div className="divide-y md:hidden">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-4">
                    <div className="mb-2 flex flex-col justify-between sm:flex-row">
                      <h4 className="mb-1 line-clamp-1 font-medium sm:mb-0">{ticket.title}</h4>
                      <div className="text-xs text-gray-500">
                        {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                      </div>
                    </div>
                    
                    <div className="mb-3 flex flex-wrap gap-2">
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        ID: {ticket.id.substring(0, 8)}...
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewTicket(ticket.id)}
                        className="text-sm"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
                  <div className="hidden sm:block">
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{tickets.length}</span> of{' '}
                      <span className="font-medium">{pagination.total}</span> tickets
                    </p>
                  </div>
                  <div className="flex flex-1 justify-between gap-2 sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      <ChevronLeft className="mr-1 size-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <div className="flex items-center">
                      <span className="text-sm">
                        Page {currentPage} of {pagination.lastPage}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="ml-1 size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Ticket Detail Drawer */}
      <Drawer open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DrawerContent className="max-h-[90vh] antialiased">
          <DrawerHeader>
            <DrawerTitle>
              {selectedTicketData ? 'Ticket Details' : 'Create Support Ticket'}
            </DrawerTitle>
            <DrawerDescription>
              {selectedTicketData 
                ? 'View the details and updates for your support ticket' 
                : 'Create a new support ticket by contacting our team'}
            </DrawerDescription>
          </DrawerHeader>
          
          {selectedTicketData ? (
            <div className="px-4 py-2">
              <div className="mb-4">
                <h3 className="text-xl font-semibold">{selectedTicketData.title}</h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  {getStatusBadge(selectedTicketData.status)}
                  {getPriorityBadge(selectedTicketData.priority)}
                  <span className="self-end text-xs text-gray-500">
                    Created on {format(new Date(selectedTicketData.createdAt), 'MMMM d, yyyy')}
                  </span>
                </div>
              </div>
              
              <div className="mb-6 rounded-md bg-gray-50 p-3">
                <h4 className="mb-1 font-medium text-gray-700">Description</h4>
                <p className="whitespace-pre-wrap text-sm text-gray-600">{selectedTicketData.description}</p>
              </div>
              
              {updates.length > 0 ? (
                <div className="mb-4">
                  <h4 className="mb-2 font-medium text-gray-700">Updates</h4>
                  <ScrollArea className="h-[300px] rounded-md border p-2">
                    <div className="space-y-3">
                      {updates.map((update, index) => (
                        <div key={index} className="rounded-md bg-white p-3 shadow-sm">
                          <div className="mb-1 flex items-center justify-between">
                            <div className='space-x-2'>
                              <span className="text-sm font-medium">{getStatusBadge(update.status)}</span>
                              <span className="rounded-md bg-gray-100 px-3 py-1 text-xs text-black">{update.createdBy}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {update.createdAt ? format(new Date(update.createdAt), 'MMM d, yyyy h:mm a') : 'N/A'}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap text-sm text-gray-600">{update.message}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <Alert className="mb-4 bg-blue-50">
                  <Info className="size-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-700">
                    No updates have been added to this ticket yet.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="px-4 py-2">
              <Alert className="mb-6 border-amber-200 bg-amber-50">
                <Info className="size-4 text-amber-600" />
                <AlertDescription className="text-sm text-amber-700">
                  To create a new support ticket, please use the contact form below. Our team will respond as soon as possible.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-center">
                <Button
                  onClick={handleSupportModalOpen}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Open Contact Form
                </Button>
              </div>
            </div>
          )}
          
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      
      {/* Support Modal for creating new tickets */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={handleSupportModalClose}
        predefinedSubject="Support Request"
        predefinedTemplate="Please describe your issue or request here. Be as specific as possible to help us assist you better.

Thank you!"
      />
    </div>
  );
}