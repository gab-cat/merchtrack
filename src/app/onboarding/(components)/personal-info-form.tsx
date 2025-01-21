import { FormField } from "@/components/form-field";

type PersonalInfoFormProps = {
  formData: {
    firstName: string
    lastName: string
    phone: string
    email: string
  }
  updateFormData: (data: Partial<PersonalInfoFormProps["formData"]>) => void
}

export default function PersonalInfoForm({ formData, updateFormData }: Readonly<PersonalInfoFormProps>) {
  const fields = [
    {
      id: "email",
      label: "Email Address",
      value: formData.email,
      onChange: (value: string) => updateFormData({ email: value }),
      required: true,
      disabled: true
    },
    {
      id: "firstName",
      label: "First Name",
      value: formData.firstName,
      onChange: (value: string) => updateFormData({ firstName: value }),
      required: true
    },
    {
      id: "lastName",
      label: "Last Name",
      value: formData.lastName,
      onChange: (value: string) => updateFormData({ lastName: value }),
      required: true
    },
    {
      id: "phone",
      label: "Phone Number",
      value: formData.phone,
      onChange: (value: string) => updateFormData({ phone: value }),
      required: true,
    },
  ];
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <FormField
          key={field.id}
          id={field.id}
          label={field.label}
          value={field.value}
          onChange={field.onChange}
          required
          disabled={field.disabled}
        />
      ))}
    </div>
  );
}

