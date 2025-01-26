import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnboardingForm } from "@/schema/user";

type CollegeAndCourseFormProps = {
  form: UseFormReturn<OnboardingForm>;
}

import { College } from "@/types/Misc";

export default function CollegeAndCourseForm({ form }: Readonly<CollegeAndCourseFormProps>) {
  const colleges = Object.values(College);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="college" className="text-sm font-medium text-gray-800">
          Select your college
        </Label>
        <Select
          value={form.watch("college")}
          onValueChange={(value) => form.setValue("college", value as College)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select a college" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-2">
            {colleges.map((college) => (
              <SelectItem className="cursor-pointer transition-colors hover:bg-primary-200" key={college} value={college}>
                {college.replaceAll("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.college && (
          <p className="text-sm text-red-500">
            {form.formState.errors.college?.message as string}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="courses" className="text-sm font-medium text-gray-800">
          Course
        </Label>
        <Input
          id="courses"
          {...form.register("courses")}
          className="mt-1"
          maxLength={100}
          placeholder="e.g. BS Computer Science, BS Information Technology, etc."
        />
        {form.formState.errors.courses && (
          <p className="text-sm text-red-500">
            {form.formState.errors.courses?.message as string}
          </p>
        )}
      </div>
    </div>
  );
}

