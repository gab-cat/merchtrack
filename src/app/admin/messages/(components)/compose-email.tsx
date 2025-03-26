'use client';

import { useState, KeyboardEvent, useEffect, useRef, useMemo } from "react";
import { MdOutlineEmail, MdClose } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoIosSend } from "react-icons/io";
import { RiMailSendFill } from "react-icons/ri";
import { HiUserGroup } from "react-icons/hi";
import { useDebounce } from 'use-debounce';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createMessageSchema, CreateMessageType } from "@/schema/messages";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import useToast from "@/hooks/use-toast";
import { createMessage } from "@/app/admin/messages/_actions";
import { useUserStore } from "@/stores/user.store";

import { cn } from "@/lib/utils";
import { useUsersQuery } from "@/hooks/users.hooks";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import UserAvatar from "@/components/shared/user-avatar";
import { QueryParams } from "@/types/common";

export default function ComposeEmail() {
  const { userId } = useUserStore();
  const toast = useToast;
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 1000);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const usersPerPage = 10; // Adjust this accordingly based on the number of users to display in the search users scroll view.

  // Fetch users for the selection panel
  
  const userQueryParams = useMemo(() => {
    const params: QueryParams = {
      limit: usersPerPage,
      take: usersPerPage,
      skip: (currentPage - 1) * usersPerPage,
      page: currentPage,
      orderBy: {
        createdAt: 'desc'
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
    
    return params;
  }, [currentPage,debouncedSearch]);

  const { data: usersData, isLoading: isLoadingUsers } = useUsersQuery(userQueryParams);

  const form = useForm({
    reValidateMode: "onBlur",
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      emails: [],
      subject: "",
      message: "",
      customerName: "",
    },
  });

  // Update form value when selectedEmails changes
  useEffect(() => {
    // @ts-expect-error - TS doesn't recognize the type of setValue
    form.setValue("emails", selectedEmails, { shouldValidate: true });
  }, [selectedEmails, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateMessageType) => createMessage({
      userId: userId as string,
      formData: data
    }),
    mutationKey: ["messages:all"],
    onSuccess: (data) => {
      form.reset();
      setSelectedEmails([]);
      setInputValue("");
      setOpen(false);

      if (data.success)
        toast({
          type: "success",
          message: "Email sent successfully.",
          title: "Success",
        });
      else 
        toast({
          type: "error",
          message: data.message ?? "Failed to send email.",
          title: "Error sending email",
        });
    },
    onError: (error) => {
      toast({
        type: "error",
        message: error.message,
        title: 'Error sending email',
      });
    }
  });

  // Filter users based on search
  const filteredUsers = usersData?.data.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return query === "" || fullName.includes(query) || email.includes(query);
  }) || [];

  // Paginate users
  const startIndex = currentPage * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const displayedUsers = searchQuery ? filteredUsers : filteredUsers.slice(startIndex, endIndex);

  // Pagination Handlers
  const nextPage = () => {
    if (endIndex < filteredUsers.length) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Handle adding email from input
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(inputValue) && !selectedEmails.includes(inputValue)) {
        setSelectedEmails(prev => [...prev, inputValue]);
        setInputValue("");
      } else {
        toast({
          type: "error",
          message: selectedEmails.includes(inputValue) 
            ? "This email is already added" 
            : "Please enter a valid email address",
          title: 'Invalid Email',
        });
      }
    }
  };

  // Handle removing an email
  const removeEmail = (email: string) => {
    setSelectedEmails(prev => prev.filter(e => e !== email));
  };

  // Handle adding a user from the selection panel
  const addUserEmail = (email: string) => {
    if (!selectedEmails.includes(email)) {
      setSelectedEmails(prev => [...prev, email]);
    }
  };

  // Select all users
  const selectAllUsers = () => {
    if (!usersData?.data.length) return;

    const allEmails = usersData.data.map(user => user.email);
    setSelectedEmails(allEmails);
    
    toast({
      type: "success",
      message: `Added ${allEmails.length} recipients`,
      title: 'All users selected',
    });
  };

  // Focus search input when dialog opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="text-white">
          <MdOutlineEmail className="mr-2" />
          Compose
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl overflow-hidden bg-neutral-2 p-0">
        <Form {...form}>
          <DialogHeader className="px-6 pb-2 pt-6">
            <DialogTitle className="flex items-center font-bold text-primary">
              <RiMailSendFill className="mr-2"/>Compose New Email
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex h-[600px]">
            {/* Left side - Email compose form */}
            <div className="flex-1 overflow-auto border-r p-6">
              <form 
                onSubmit={form.handleSubmit((data) => mutate(data))} 
                className="flex h-full flex-col space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email-input" className="flex items-center">Recipients</Label>
                  <FormField
                    control={form.control}
                    {...form.register("emails")}
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-md border p-2">
                            {selectedEmails.map((email) => (
                              <Badge key={email} className="bg-blue-100 py-1.5 text-blue-700 hover:bg-blue-200">
                                {email}
                                <button
                                  type="button"
                                  onClick={() => removeEmail(email)}
                                  className="ml-1 text-blue-700 hover:text-blue-900"
                                >
                                  <MdClose size={16} />
                                </button>
                              </Badge>
                            ))}
                            <Input
                              id="email-input"
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder="Type email and press Enter"
                              className="h-8 min-w-[150px] flex-1 border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                              disabled={isPending}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject" className="flex items-center">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Enter subject"
                    required
                    disabled={isPending}
                    {...form.register("subject")}
                  />
                </div>
                
                <div className="flex-1 space-y-2">
                  <Label htmlFor="message" className="flex items-center">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Type your message here..."
                    className="h-[200px] flex-1"
                    required
                    disabled={isPending}
                    {...form.register("message")}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="flex items-center">Customer Name</Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    required
                    disabled={isPending}
                    {...form.register("customerName")}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setOpen(false)}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className={cn('text-white', isPending && 'bg-gray-400')}
                    disabled={isPending || Object.keys(form.formState.errors).length > 0}
                  >
                    {isPending ? (
                      <AiOutlineLoading3Quarters className="mr-2 size-5 animate-spin" />
                    ) : (
                      <IoIosSend className="mr-2 size-5" />
                    )}
                    {isPending ? "Sending..." : "Send Email"}
                  </Button>
                </div>
              </form>
            </div>
            
            {/* Right side - User search and selection */}
            <div className="flex h-full w-[350px] flex-col">
              <div className="border-b p-4">
                <div className="relative mb-2">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="pl-10 pr-4"
                  />
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex w-full items-center justify-center border-primary text-primary hover:bg-primary-100"
                  onClick={selectAllUsers}
                  disabled={isLoadingUsers || isPending}
                >
                  <HiUserGroup className="mr-2" />
                  Select All Users
                </Button>
              </div>
              
              <ScrollArea className="flex-1">
                {isLoadingUsers ? (
                  <div className="flex h-full items-center justify-center">
                    <AiOutlineLoading3Quarters className="size-6 animate-spin text-primary" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No users found
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {displayedUsers.map((user) => (
                      <button 
                        type="button"
                        key={user.id} 
                        className={cn(
                          "flex w-full items-center p-2 rounded-md cursor-pointer transition-colors",
                          selectedEmails.includes(user.email) 
                            ? "bg-primary/10" 
                            : "hover:bg-gray-100"
                        )}
                        onClick={() => addUserEmail(user.email)}
                      >
                        <UserAvatar 
                          userId={user.clerkId}
                          firstName={user.firstName ?? ""}
                          lastName={user.lastName ?? ""}
                          email={user.email}
                          className="mr-3"
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-left text-sm font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="truncate text-left text-xs text-gray-500">
                            {user.email}
                          </p>
                        </div>
                        {selectedEmails.includes(user.email) && (
                          <Badge className="ml-2 bg-primary">
                            Added
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <div>
                <div className="m-4 flex place-content-around gap-2">
                  <button 
                    onClick={prevPage} 
                    disabled={currentPage === 0}
                    className="h-10 w-24 rounded bg-blue-500 px-4 py-2 text-white transition active:scale-95 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button 
                    onClick={nextPage} 
                    disabled={endIndex >= filteredUsers.length}
                    className="h-10 w-24 rounded bg-blue-500 px-4 py-2 text-white transition active:scale-95 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
