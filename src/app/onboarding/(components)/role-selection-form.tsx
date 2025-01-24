import type { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { OnboardingForm } from "@/schema/user";
import { Role } from "@/types/Misc";

type RoleSelectionFormProps = {
  form: UseFormReturn<OnboardingForm>;
}

export default function RoleSelectionForm({ form }: Readonly<RoleSelectionFormProps>) {
  const roles = [
    { value: Role.PLAYER, label: "Player" },
    { value: Role.STUDENT, label: "Student" },
    { value: Role.STAFF_FACULTY, label: "Staff Faculty" },
    { value: Role.ALUMNI, label: "Alumni" },
    { value: Role.OTHERS, label: "Others" },
  ];

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-gray-800">Select your role</Label>
      <RadioGroup
        value={form.watch("role")}
        onValueChange={(value) => form.setValue("role", value as Role)}
        className="space-y-2"
      >
        {roles.map(({ value, label }) => (
          <div key={value} className="flex items-center space-x-2">
            <RadioGroupItem value={value} id={value} />
            <Label htmlFor={value} className="text-sm text-gray-700">
              {label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {form.formState.errors.role && (
        <p className="text-sm text-red-500">
          {form.formState.errors.role?.message as string}
        </p>
      )}
    </div>
  );
}

