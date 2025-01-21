import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type RoleSelectionFormProps = {
  formData: {
    role: string
  }
  updateFormData: (data: Partial<RoleSelectionFormProps["formData"]>) => void
}

export default function RoleSelectionForm({ formData, updateFormData }: Readonly<RoleSelectionFormProps>) {
  const roles = ["PLAYER", "STUDENT", "STAFF_FACULTY", "ALUMNI", "OTHERS"];

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-gray-800">Select your role</Label>
      <RadioGroup
        value={formData.role}
        onValueChange={(value) => updateFormData({ role: value })}
        className="space-y-2"
      >
        {roles.map((role) => (
          <div key={role} className="flex items-center space-x-2">
            <RadioGroupItem value={role} id={role} />
            <Label htmlFor={role} className="text-sm text-gray-700">
              {role.replace("_", " ")}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

