'use client';

import { useState, useEffect } from "react";
import { FiLoader, FiMail, FiPhone, FiUser, FiUsers, FiBookOpen, FiTag } from "react-icons/fi";
import { User } from "@prisma/client";
import { FormSection } from "@/components/shared/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserQuery } from "@/hooks/users.hooks";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type CustomerValidationProps = {
  onCustomerValidated: (customer: User | null) => void;
  disabled?: boolean;
};

export function CustomerValidation({ onCustomerValidated, disabled }: Readonly<CustomerValidationProps>) {
  const [email, setEmail] = useState("");
  const [validatedEmail, setValidatedEmail] = useState<string | null>(null);
  const { data: userData, isLoading, error } = useUserQuery(validatedEmail as string);

  // Move success handler into an effect
  useEffect(() => {
    if (userData?.email) {
      onCustomerValidated(userData);
    }
  }, [userData, onCustomerValidated]);

  const handleValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setValidatedEmail(email);
  };

  const handleReset = () => {
    setEmail("");
    setValidatedEmail(null);
    onCustomerValidated(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleValidation(e);
    }
  };

  if (isLoading && validatedEmail) {
    return (
      <FormSection title="Customer Information">
        <div className="flex items-center justify-center p-8">
          <FiLoader className="size-8 animate-spin text-primary" />
          <span className="ml-2">Validating customer...</span>
        </div>
      </FormSection>
    );
  }

  if (error && validatedEmail) {
    return (
      <FormSection title="Customer Information">
        <Alert variant="destructive">
          <AlertDescription>
            Could not validate customer. Please check the email and try again.
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={handleReset} variant="outline">
          Try Different Email
        </Button>
      </FormSection>
    );
  }

  if (userData && validatedEmail) {
    return (
      <FormSection title="Customer Information">
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <div className="divide-border grid divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="space-y-4 p-4 md:p-6">
              <div className="flex items-start gap-3">
                <FiUser className="mt-1 text-primary" />
                <div className="flex-1">
                  <Label className="text-muted-foreground text-xs font-normal">Name</Label>
                  <p className="font-medium">{userData.firstName} {userData.lastName}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <FiMail className="mt-1 text-primary" />
                <div className="flex-1">
                  <Label className="text-muted-foreground text-xs font-normal">Email</Label>
                  <p className="break-all font-medium">{userData.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiPhone className="mt-1 text-primary" />
                <div className="flex-1">
                  <Label className="text-muted-foreground text-xs font-normal">Phone</Label>
                  <p className="font-medium">{userData.phone || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 md:p-6">
              <div className="flex items-start gap-3">
                <FiUsers className="mt-1 text-primary" />
                <div className="flex-1">
                  <Label className="text-muted-foreground text-xs font-normal">Role</Label>
                  <div className="mt-1">
                    <Badge variant="secondary">{userData.role}</Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiBookOpen className="mt-1 text-primary" />
                <div className="flex-1">
                  <Label className="text-muted-foreground text-xs font-normal">College</Label>
                  <div className="mt-1">
                    <Badge variant="outline">{userData.college}</Badge>
                  </div>
                </div>
              </div>

              {userData.isStaff && (
                <div className="flex items-start gap-3">
                  <FiTag className="mt-1 text-primary" />
                  <div className="flex-1">
                    <Label className="text-muted-foreground text-xs font-normal">Status</Label>
                    <div className="mt-1">
                      <Badge variant="default" className="bg-primary">Staff Member</Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
        <Button 
          className="mt-4" 
          onClick={handleReset} 
          variant="outline"
          size="sm"
        >
          Change Email
        </Button>
      </FormSection>
    );
  }

  return (
    <FormSection title="Customer Information">
      <div className="mx-auto max-w-lg">
        <form onSubmit={handleValidation} className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <Label htmlFor="email" className="text-sm">
              Customer Email
            </Label>
            <div className="relative mt-1.5">
              <FiMail className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter customer email"
                disabled={disabled}
                className="pl-10"
              />
            </div>
          </div>
          <Button 
            type="submit"
            className="mt-auto whitespace-nowrap text-white"
            disabled={!email || disabled}
            size="sm"
          >
            Validate Email
          </Button>
        </form>
      </div>
    </FormSection>
  );
}