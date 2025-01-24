import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { OnboardingForm } from "@/schema/user";

type PersonalInfoFormProps = {
  form: UseFormReturn<OnboardingForm>;
}

export default function PersonalInfoForm({ form }: Readonly<PersonalInfoFormProps>) {
  const fields = [
    {
      id: "email" as const,
      label: "Email Address",
      disabled: true
    },
    {
      id: "firstName" as const,
      label: "First Name",
    },
    {
      id: "lastName" as const,
      label: "Last Name",
    },
    {
      id: "phone" as const,
      label: "Phone Number",
    },
  ];

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <label htmlFor={field.id} className="block text-sm font-medium text-gray-800">
            {field.label}
          </label>
          <Input
            id={field.id}
            disabled={field.disabled}
            {...form.register(field.id)}
          />
          {form.formState.errors[field.id] && (
            <p className="text-sm text-red-500">
              {form.formState.errors[field.id]?.message as string}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

