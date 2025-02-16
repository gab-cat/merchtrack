"use client";

import { useState } from "react";
import { Role, College, User } from "@prisma/client";
import { FaUser, FaEdit, FaEnvelope, FaGraduationCap, FaCalendarAlt, FaCircle, FaUserShield, FaSave } from "react-icons/fa";
import Image from "next/image";
import { useUserQuery } from "@/hooks/users.hooks";
import { useUserImageQuery } from "@/hooks/messages.hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfileDetailsProps {
  email: string;
}

export function UserProfileDetails({ email }: UserProfileDetailsProps) {
  const { data: user, isLoading } = useUserQuery(decodeURIComponent(email));
  const { data: userImage } = useUserImageQuery(user?.clerkId);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User> | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement update user functionality
    console.log('Update user:', formData);
    setIsEditing(false);
  };

  const handleCollegeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      college: value as College
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value as Role
    }));
  };

  return (
    <Card className="group overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <CardTitle className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 self-start">
            <FaUserShield className="size-5" />
            Profile Information
          </div>
          <p className="text-sm font-normal text-blue-100">
            Manage user basic information and roles
          </p>
        </CardTitle>
        {!isEditing && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setFormData(user);
              setIsEditing(true);
            }}
            className="text-white hover:bg-blue-700/20"
          >
            <FaEdit className="mr-2 size-4" />
            Edit Profile
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="relative size-32">
              {userImage ? (
                <Image
                  src={userImage}
                  alt={`${user.firstName}'s profile picture`}
                  fill
                  className="rounded-full object-cover ring-2 ring-blue-600 ring-offset-2"
                />
              ) : (
                <div className="flex size-full items-center justify-center rounded-full bg-blue-50 ring-2 ring-blue-600 ring-offset-2">
                  <FaUser className="size-12 text-blue-600" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
              <FaUserShield className="size-4" />
              {Role[user.role]}
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="flex-1 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData?.firstName || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData?.lastName || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData?.email || ""}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="college">College</Label>
                  <Select
                    value={formData?.college || ""}
                    onValueChange={handleCollegeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select college" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(College).map((college) => (
                        <SelectItem key={college} value={college}>
                          {college}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData?.role || ""}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Role).map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-600 text-neutral-2 hover:bg-blue-700">
                  <FaSave className="mr-2 text-neutral-2"/>
                  Save Changes
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setFormData(null);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex-1">
              <dl className="grid gap-4 md:grid-cols-2">
                <div>
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <FaUser className="size-4 text-blue-600" />
                    First Name
                  </dt>
                  <dd className="text-gray-900">{user.firstName}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <FaUser className="size-4 text-blue-600" />
                    Last Name
                  </dt>
                  <dd className="text-gray-900">{user.lastName}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <FaEnvelope className="size-4 text-blue-600" />
                    Email
                  </dt>
                  <dd className="text-gray-900">{user.email}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <FaGraduationCap className="size-4 text-blue-600" />
                    College
                  </dt>
                  <dd className="text-gray-900">{user.college || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <FaCalendarAlt className="size-4 text-blue-600" />
                    Member Since
                  </dt>
                  <dd className="text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <FaCircle className={`size-4 ${user.isDeleted ? 'text-red-600' : 'text-green-600'}`} />
                    Status
                  </dt>
                  <dd className={`font-medium ${user.isDeleted ? 'text-red-600' : 'text-green-600'}`}>
                    {user.isDeleted ? "Deactivated" : "Active"}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function UserProfileSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500">
        <Skeleton className="h-8 w-48 bg-white/20" />
        <Skeleton className="h-9 w-28 bg-white/20" />
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex gap-6">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="size-32 rounded-full" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex-1">
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="mb-1 h-5 w-24" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}