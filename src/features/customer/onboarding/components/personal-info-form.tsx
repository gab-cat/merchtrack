import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { motion } from "framer-motion";
import { Phone, AtSign, User, Info, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { OnboardingForm } from "@/features/customer/onboarding/users.schema";

type PersonalInfoFormProps = {
  form: UseFormReturn<OnboardingForm>;
}

export default function PersonalInfoForm({ form }: Readonly<PersonalInfoFormProps>) {
  const [focused, setFocused] = useState<string | null>(null);

  const PERSONAL_INFO_FIELDS = [
    {
      id: "firstName",
      label: "First Name",
      placeholder: "Enter your first name",
      icon: <User className="size-4 text-primary" />,
      isDisabled: false,
      required: true
    },
    {
      id: "lastName",
      label: "Last Name",
      placeholder: "Enter your last name",
      icon: <User className="size-4 text-primary" />,
      isDisabled: false,
      required: true
    },
    {
      id: "phone",
      label: "Phone Number",
      placeholder: "Enter your phone number",
      icon: <Phone className="size-4 text-primary" />,
      isDisabled: false,
      required: true
    },
    {
      id: "email",
      label: "Email Address",
      placeholder: "Enter your email address",
      icon: <AtSign className="size-4 text-primary" />,
      isDisabled: true,
      required: true
    },
  ] as const;

  return (
    <div className="space-y-4">
      {PERSONAL_INFO_FIELDS.map((field) => (
        <motion.div 
          key={field.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: PERSONAL_INFO_FIELDS.indexOf(field) * 0.1 }}
        >
          <FormField
            control={form.control}
            name={field.id as keyof OnboardingForm}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
                  {field.icon}
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      {...formField}
                      disabled={field.isDisabled}
                      placeholder={field.placeholder}
                      className={`pl-3 transition-all duration-200 ${
                        focused === field.id
                          ? "border-primary/50 ring-1 ring-primary/20"
                          : "border-gray-200"
                      } ${
                        form.formState.errors[field.id as keyof OnboardingForm]
                          ? "border-red-300 pr-10"
                          : ""
                      }`}
                      onFocus={() => setFocused(field.id)}
                      onBlur={() => {
                        setFocused(null);
                        formField.onBlur();
                      }}
                    />
                  </FormControl>
                  {form.formState.errors[field.id as keyof OnboardingForm] && (
                    <AlertCircle className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-red-500" />
                  )}
                </div>
                <FormMessage />
                {field.id === "phone" && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <Info className="size-3" /> Format: +63XXXXXXXXXX (PH), +1XXXXXXXXXX (US)
                  </p>
                )}
              </FormItem>
            )}
          />
        </motion.div>
      ))}
    </div>
  );
}

