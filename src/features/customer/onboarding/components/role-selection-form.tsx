
import type { UseFormReturn } from "react-hook-form";
import { motion } from "framer-motion";
import { School, Building, Users, Check, School2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { OnboardingForm } from "@/features/customer/onboarding/users.schema";
import { Role } from "@/types/Misc";

type RoleSelectionFormProps = {
  form: UseFormReturn<OnboardingForm>;
}

export default function RoleSelectionForm({ form }: Readonly<RoleSelectionFormProps>) {
  const roles = [
    // { 
    //   value: Role.PLAYER, 
    //   label: "Player",
    //   icon: <UserRound className="size-5" />,
    //   description: "Student athlete representing your college"
    // },
    { 
      value: Role.STUDENT, 
      label: "Student",
      icon: <School className="size-5" />,
      description: "Currently enrolled student"
    },
    { 
      value: Role.STAFF_FACULTY, 
      label: "Staff Faculty",
      icon: <Building className="size-5" />,
      description: "University employee or faculty member"
    },
    { 
      value: Role.ALUMNI, 
      label: "Alumni",
      icon: <School2 className="size-5" />,
      description: "Former student of the university"
    },
    { 
      value: Role.OTHERS, 
      label: "Others",
      icon: <Users className="size-5" />,
      description: "External visitor or guest"
    },
  ];

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-gray-800">Select your role</Label>
      <div className="space-y-3">
        {roles.map((role, index) => (
          <motion.div
            key={role.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex w-full flex-col" 
          >
            <button
              type="button"
              className={`relative flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all hover:bg-gray-50 ${
                form.watch("role") === role.value
                  ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30"
                  : "border-gray-200"
              }`}
              onClick={() => form.setValue("role", role.value)}
            >
              <div className={`flex size-10 items-center justify-center rounded-full ${
                form.watch("role") === role.value
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-500"
              }`}>
                {role.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-800">{role.label}</p>
                <p className="text-sm text-gray-500">{role.description}</p>
              </div>
              {form.watch("role") === role.value && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="flex size-6 items-center justify-center rounded-full bg-primary text-white">
                    <Check className="size-4" />
                  </div>
                </div>
              )}
            </button>
          </motion.div>
        ))}
      </div>
      {form.formState.errors.role && (
        <p className="text-sm text-red-500">
          {form.formState.errors.role?.message as string}
        </p>
      )}
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
        <p className="">We may require you to provide additional information based on your role selection.</p>
      </div>
    </div>
  );
}

