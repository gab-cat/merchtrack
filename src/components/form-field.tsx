import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  type?: string;
  className?: string;
};

export function FormField({
  id,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  type = "text",
  className = "",
}: Readonly<FormFieldProps>) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="text-sm font-medium text-gray-800">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className="mt-1"
      />
    </div>
  );
}
