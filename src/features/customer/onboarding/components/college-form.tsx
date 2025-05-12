'use client';

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { motion } from "framer-motion";
import { School, BookOpen, Building2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnboardingForm } from "@/features/customer/onboarding/users.schema";
import { College } from "@/types/Misc";

type CollegeAndCourseFormProps = {
  form: UseFormReturn<OnboardingForm>;
}

export default function CollegeAndCourseForm({ form }: Readonly<CollegeAndCourseFormProps>) {
  const [focused, setFocused] = useState(false);
  const colleges = Object.values(College);
  
  // Reorder colleges to have NOT_APPLICABLE first for better UX
  const orderedColleges = [
    College.NOT_APPLICABLE,
    ...colleges.filter(college => college !== College.NOT_APPLICABLE)
  ];

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <FormField
          control={form.control}
          name="college"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
                <Building2 className="size-4 text-primary" />
                Select your college
                <span className="text-red-500">*</span>
              </FormLabel>
              <div className="relative">
                <Select
                  value={field.value || ""}
                  onValueChange={(value) => field.onChange(value as College)}
                >
                  <FormControl>
                    <SelectTrigger className={`transition-all duration-200 ${
                      form.formState.errors.college
                        ? "border-red-300"
                        : "border-gray-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    }`}>
                      <SelectValue placeholder="Please select a college" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-80 bg-neutral-2">
                    {orderedColleges.map((college) => (
                      <SelectItem 
                        key={college} 
                        value={college}
                        className="cursor-pointer transition-colors hover:bg-primary/10"
                      >
                        <div className="flex items-center gap-2">
                          <School className="size-4 text-primary" />
                          {college === College.NOT_APPLICABLE ? "Not Applicable (N/A)" : college.replaceAll("_", " ")}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.college && (
                  <AlertCircle className="absolute right-9 top-1/2 size-5 -translate-y-1/2 text-red-500" />
                )}
              </div>
              <FormMessage  className="text-red-500"/>
              <p className="mt-1 text-xs text-gray-500">
                Please select the college you are affiliated with, or &quot;Not Applicable&quot;
              </p>
              <p className="mt-1 text-xs text-gray-500">
                For Alumni, please select your last attended college. For Staff/Faculty, please select your current college.
              </p>
            </FormItem>
          )}
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <FormField
          control={form.control}
          name="courses"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
                <BookOpen className="size-4 text-primary" />
                Course / Program
                <span className="text-red-500">*</span>
              </FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. BS Computer Science, BS Information Technology"
                    className={`transition-all duration-200 ${
                      focused
                        ? "border-primary/50 ring-1 ring-primary/20"
                        : "border-gray-200"
                    } ${
                      form.formState.errors.courses
                        ? "border-red-300 pr-10"
                        : ""
                    }`}
                    maxLength={100}
                    onFocus={() => setFocused(true)}
                    onBlur={() => {
                      setFocused(false);
                      field.onBlur();
                    }}
                  />
                </FormControl>
                {form.formState.errors.courses && (
                  <AlertCircle className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-red-500" />
                )}
              </div>
              <FormMessage className="text-red-500"/>
              <p className="mt-1 text-xs text-gray-500">
                Enter your degree program or course of study
              </p>
            </FormItem>
          )}
        />
      </motion.div>
    </div>
  );
}

