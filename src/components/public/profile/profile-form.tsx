"use client";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm() {
  return (
    <form className="mx-auto w-full max-w-md space-y-4">
      {[
        { name: "name", label: "Name", type: "text", value: "John Doe" },
        { name: "email", label: "Email", type: "email", value: "john.doe@example.com" },
        { name: "phoneNumber", label: "Phone Number", type: "tel", value: "09213653016" },
        { name: "password", label: "Password", type: "password", value: "••••••••••••" },
        { name: "customerType", label: "Customer Type", type: "text", value: "COCS Student" },
      ].map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name} className="text-sm text-gray-600">
            {field.label}
          </Label>
          <div className="relative">
            <Input
              id={field.name}
              name={field.name}
              type={field.type}
              defaultValue={field.value}
              className="border-transparent bg-blue-50 pr-10 focus:border-blue-500"
              readOnly
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => console.log(`Edit ${field.name}`)}
            >
              <Pencil className="size-4" />
            </button>
          </div>
        </div>
      ))}
      <Button type="button" variant="destructive" className="mt-6 w-full bg-red-500 hover:bg-red-600">
        Delete Account
      </Button>
    </form>
  );
}

