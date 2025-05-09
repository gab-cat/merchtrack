'use client';

import { useState } from "react";
import { IoMailOutline } from "react-icons/io5";
import { RiMailSendLine } from "react-icons/ri";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { sendPaymentReminders } from "../_actions/reminders";
import { usePendingPaymentOrdersQuery } from "@/hooks/reminders.hooks";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/ui/pagination";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PaymentReminderFormData, paymentReminderSchema } from "@/schema/reminders.schema";
import { useUserStore } from "@/stores/user.store";

const ITEMS_PER_PAGE = 10;

export default function PaymentReminders() {
  const { userId } = useUserStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const { data, isPending } = usePendingPaymentOrdersQuery({
    page: currentPage,
    take: ITEMS_PER_PAGE,
  });
  const orders = data?.data ?? [];
  const metadata = data?.metadata;

  const form = useForm<PaymentReminderFormData>({
    resolver: zodResolver(paymentReminderSchema),
    defaultValues: {
      orderIds: [],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
    }
  });

  const { mutate: sendReminders, isPending: isSending } = useMutation({
    mutationFn: async (data: PaymentReminderFormData) => {
      return sendPaymentReminders({
        userId: userId!,
        ...data
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        setSelectedOrders([]);
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
      form.setValue('orderIds', []);
    } else {
      const newSelected = orders.map(order => order.id);
      setSelectedOrders(newSelected);
      form.setValue('orderIds', newSelected);
    }
  };

  const handleSelectOrder = (orderId: string) => {
    const updatedSelection = selectedOrders.includes(orderId)
      ? selectedOrders.filter(id => id !== orderId)
      : [...selectedOrders, orderId];
    
    setSelectedOrders(updatedSelection);
    form.setValue('orderIds', updatedSelection);
  };

  const handleSendReminders = () => {
    if (selectedOrders.length === 0) {
      toast.error("Please select at least one order");
      return;
    }
    
    form.handleSubmit((data) => {
      sendReminders(data);
    })();
  };

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8">
        <IoMailOutline className="size-12 text-gray-400" />
        <p className="text-center text-gray-500">No orders with pending payments found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              checked={selectedOrders.length === orders.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-gray-500">
              {selectedOrders.length} orders selected
            </span>
          </div>

          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !form.getValues("dueDate") && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 size-4" />
                {form.getValues("dueDate") ? (
                  format(form.getValues("dueDate"), "PPP")
                ) : (
                  <span>Pick a due date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto bg-white p-0">
              <Calendar
                className="bg-white"
                mode="single"
                selected={form.getValues("dueDate")}
                onSelect={(date) => {
                  form.setValue("dueDate", date ?? new Date());
                  setIsCalendarOpen(false);
                }}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button 
          onClick={handleSendReminders}
          disabled={selectedOrders.length === 0 || isSending}
          className="flex items-center space-x-2"
        >
          <RiMailSendLine className="size-4" />
          <span>Send Reminders</span>
        </Button>
      </div>

      <div className="rounded-md border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-4 py-3"></th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Order ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Order Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedOrders.includes(order.id)}
                    onCheckedChange={() => handleSelectOrder(order.id)}
                  />
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">#{order.id}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {order.customer.firstName} {order.customer.lastName}
                  <br />
                  <span className="text-xs text-gray-400">{order.customer.email}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  ₱{order.totalAmount.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "inline-flex rounded-full px-2 text-xs font-semibold",
                    order.paymentStatus === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  )}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {metadata && metadata.total > ITEMS_PER_PAGE && (
        <div className="mt-4 flex items-center justify-between px-2">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
            {Math.min(currentPage * ITEMS_PER_PAGE, metadata.total)} of {metadata.total} entries
          </div>
          <Pagination
            page={currentPage}
            total={metadata.lastPage}
            onChange={setCurrentPage}
            hasNextPage={currentPage < metadata.lastPage}
            hasPrevPage={currentPage > 1}
          />
        </div>
      )}
    </div>
  );
}

