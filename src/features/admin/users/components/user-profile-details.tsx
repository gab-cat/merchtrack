"use client";

import { useEffect, useState } from "react";
import { FaUser, FaEdit, FaEnvelope, FaCircle, FaUserShield, FaSave, FaUsers } from "react-icons/fa";
import Image from "next/image";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserDetails } from "@/features/admin/users/actions";
import { College, Role } from "@/types/Misc";
import { useUserQuery } from "@/hooks/users.hooks";
import { useUserImageQuery } from "@/hooks/messages.hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { updateUserSchema, type UpdateUserType } from "@/features/admin/users/users.schema";
import { useUserStore } from "@/stores/user.store";
import UserAvatar from "@/components/shared/user-avatar";

interface UserProfileDetailsProps {
  email: string;
}

export function UserProfileDetails({ email }: UserProfileDetailsProps) {
  const { data: user, isLoading, refetch } = useUserQuery(decodeURIComponent(email));
  const { data: userImage } = useUserImageQuery(user?.clerkId);
  const [isEditing, setIsEditing] = useState(false);
  const { userId: currentUserId } = useUserStore();
  const [managedStaff, setManagedStaff] = useState(user?.User ?? []);
  const queryClient = useQueryClient();
  
  // Fetch manager data if user has a manager
  const { data: manager } = useUserQuery(
    user?.managerId || "",
    user?.managerId ? undefined : [],
    {
      User: true,
    }
  );
  
  // Form setup
  const form = useForm<UpdateUserType>({
    resolver: zodResolver(updateUserSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      role: "STUDENT" as Role,
      college: "COCS" as College,
      courses: "",
      isStaff: false,
      isAdmin: false
    }
  });
  
  // Fetch staff members managed by this user
  useEffect(() => {
    if (user) {
      setManagedStaff(user.User || []);
    }
  }, [user]);

  // Reset form with user data when user data is loaded or edit mode is toggled
  useEffect(() => {
    if (user) {
      // Always reset the form when user data changes, regardless of edit mode
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        role: user.role as Role,
        college: user.college as College,
        courses: user.courses || "",
        isStaff: user.isStaff || false,
        isAdmin: user.isAdmin || false
      });
    }
  }, [user, form]);

  // Toggle edit mode handler
  const toggleEditMode = () => {
    if (!isEditing && user) {
      // Ensure form values are up to date when entering edit mode
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        role: user.role as Role,
        college: user.college as College,
        courses: user.courses || "",
        isStaff: user.isStaff || false,
        isAdmin: user.isAdmin || false
      });
    }
    setIsEditing(prev => !prev);
  };

  const mutation = useMutation({
    mutationFn: async (data: UpdateUserType) => {
      if (!user || !currentUserId) throw new Error("Missing required data");
      
      const result = await updateUserDetails({
        userId: currentUserId,
        targetUserId: user.id,
        data
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    },
    onSuccess: () => {
      toast.success("User details updated successfully");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  if (isLoading) {
    return <UserProfileSkeleton />;
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="flex min-h-[200px] items-center justify-center">
          <p className="text-muted-foreground">User not found</p>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = (data: UpdateUserType) => {
    mutation.mutate(data);
  };

  return (
    <Card className="group overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="size-16 overflow-hidden rounded-full border-4 border-white/20 bg-white/10">
              {userImage ? (
                <Image
                  src={userImage}
                  alt={`${user.firstName} ${user.lastName}`}
                  fill
                  className="rounded-full border border-white object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-2xl font-bold">
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </div>
              )}
            </div>
          </div>
          <div>
            <CardTitle className="text-xl">
              {user.firstName} {user.lastName}
            </CardTitle>
            <div className="mt-1 flex items-center gap-2 text-sm text-blue-100">
              <FaEnvelope className="size-3" />
              <span>{user.email}</span>
            </div>
          </div>
        </div>
        
        <div>
          {isEditing ? (
            <Button 
              size="sm" 
              variant="outline" 
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              onClick={form.handleSubmit(handleSubmit)}
              disabled={mutation.isPending}
            >
              <FaSave className="mr-2 size-4" />
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              onClick={toggleEditMode}
            >
              <FaEdit className="mr-2 size-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {isEditing ? (
          <form className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName"
                  placeholder="First Name"
                  {...form.register("firstName")}
                />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName"
                  placeholder="Last Name"
                  {...form.register("lastName")}
                />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone"
                placeholder="Phone Number"
                {...form.register("phone")}
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
              )}
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  defaultValue={user.role}
                  value={form.watch("role")} 
                  onValueChange={(value) => form.setValue("role", value as Role)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="STAFF_FACULTY">Staff/Faculty</SelectItem>
                    <SelectItem value="PLAYER">Player</SelectItem>
                    <SelectItem value="ALUMNI">Alumni</SelectItem>
                    <SelectItem value="OTHERS">Others</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.role && (
                  <p className="text-sm text-red-500">{form.formState.errors.role.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="college">College</Label>
                <Select 
                  defaultValue={user.college}
                  value={form.watch("college")} 
                  onValueChange={(value) => form.setValue("college", value as College)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select College" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(College).map((college) => (
                      <SelectItem key={college} value={college}>
                        {college}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.college && (
                  <p className="text-sm text-red-500">{form.formState.errors.college.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="courses">Courses/Programs</Label>
              <Input 
                id="courses"
                placeholder="Courses/Programs"
                {...form.register("courses")}
              />
              {form.formState.errors.courses && (
                <p className="text-sm text-red-500">{form.formState.errors.courses.message}</p>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isStaff"
                  checked={form.watch("isStaff")}
                  onChange={(e) => form.setValue("isStaff", e.target.checked)}
                  className="size-4 rounded border-gray-300"
                />
                <Label htmlFor="isStaff">Staff Member</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={form.watch("isAdmin")}
                  onChange={(e) => form.setValue("isAdmin", e.target.checked)}
                  className="size-4 rounded border-gray-300"
                />
                <Label htmlFor="isAdmin">Administrator</Label>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-medium text-gray-500">Personal Information</h3>
                <div className="space-y-4 rounded-lg border bg-gray-50/50 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500">First Name</p>
                      <p className="font-medium text-gray-800">{user.firstName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Last Name</p>
                      <p className="font-medium text-gray-800">{user.lastName}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-800">{user.phone || "Not provided"}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-gray-500">Member Since</p>
                    <p className="font-medium text-gray-800">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="mb-3 text-sm font-medium text-gray-500">Profile Information</h3>
                <div className="space-y-4 rounded-lg border bg-gray-50/50 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Role</p>
                      <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-700">
                        {user.role}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">College</p>
                      <Badge variant="secondary" className="mt-1 bg-purple-100 text-purple-700">
                        {user.college}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-gray-500">Courses/Programs</p>
                    <p className="font-medium text-gray-800">{user.courses || "Not specified"}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {user.isStaff && (
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                        <FaUserShield className="mr-1 size-3" />
                        Staff Member
                      </Badge>
                    )}
                    
                    {user.isAdmin && (
                      <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                        <FaUser className="mr-1 size-3" />
                        Administrator
                      </Badge>
                    )}
                    
                    <Badge 
                      variant="outline" 
                      className={user.isDeleted 
                        ? "border-red-200 bg-red-50 text-red-700" 
                        : "border-green-200 bg-green-50 text-green-700"}
                    >
                      <FaCircle className={`mr-1 size-2 ${user.isDeleted ? "text-red-500" : "text-green-500"}`} />
                      {user.isDeleted ? 'Inactive' : 'Active'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Management Information Section */}
            {(manager || (managedStaff && managedStaff.length > 0)) && (
              <>
                <Separator className="my-6" />
                
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-primary-600">
                    <FaUserShield className="size-4" />
                    Management Information
                  </h3>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Manager Information */}
                    {manager && (
                      <div>
                        <h4 className="mb-3 text-xs font-medium text-gray-500">Reporting To</h4>
                        <div className="rounded-lg border bg-blue-50/50 p-4">
                          <div className="flex items-center gap-4">
                            <UserAvatar
                              userId={manager.clerkId}
                              firstName={manager.firstName!}
                              lastName={manager.lastName!}
                              email={manager.email!}
                              className="size-14 border shadow-sm" 
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {manager.firstName} {manager.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{manager.email}</p>
                              <Badge className="mt-1 bg-blue-100 text-blue-700">
                                <FaUserShield className="mr-1 size-3" />
                                Manager
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Staff Members User Manages */}
                    {managedStaff && managedStaff.length > 0 && (
                      <div>
                        <h4 className="mb-3 text-xs font-medium text-gray-500">
                          Staff Members ({managedStaff.length})
                        </h4>
                        <div className="rounded-lg border bg-gray-50/50 p-4">
                          <div className="space-y-3 overflow-hidden">
                            {managedStaff.slice(0, 3).map((staff) => (
                              <div key={staff.id} className="flex items-center gap-3">
                                <UserAvatar
                                  userId={staff.clerkId}
                                  firstName={staff.firstName!}
                                  lastName={staff.lastName!}
                                  email={staff.email!}
                                  className="size-10 border shadow-sm"
                                />
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {staff.firstName} {staff.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500">{staff.email}</p>
                                </div>
                              </div>
                            ))}
                            
                            {managedStaff.length > 3 && (
                              <div className="mt-2 text-center">
                                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                  <FaUsers className="mr-1 size-3" />
                                  {managedStaff.length - 3} more staff {managedStaff.length - 3 === 1 ? 'member' : 'members'}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UserProfileSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500 pb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full bg-white/20" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32 bg-white/20" />
            <Skeleton className="h-4 w-48 bg-white/20" />
          </div>
        </div>
        <Skeleton className="h-10 w-28 rounded-md bg-white/20" />
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-4 rounded-lg border p-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
          
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-4 rounded-lg border p-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}