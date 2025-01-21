import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CollegeAndCourseFormProps = {
  formData: {
    college: string
    courses: string
  }
  updateFormData: (data: Partial<CollegeAndCourseFormProps["formData"]>) => void
}

export default function CollegeAndCourseForm({ formData, updateFormData }: Readonly<CollegeAndCourseFormProps>) {
  const colleges = ["NOT_APPLICABLE", "COCS", "STEP", "ABBS", "JPIA", "ACHSS", "ANSA", "COL", "AXI"];

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="college" className="text-sm font-medium text-gray-800">
          Select your college
        </Label>
        <Select value={formData.college} onValueChange={(value) => updateFormData({ college: value })}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select a college" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-2">
            {colleges.map((college) => (
              <SelectItem className="cursor-pointer transition-colors hover:bg-primary-200" key={college} value={college}>
                {college.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="courses" className="text-sm font-medium text-gray-800">
          Course
        </Label>
        <Input
          id="courses"
          value={formData.courses}
          onChange={(e) => updateFormData({ courses: e.target.value })}
          className="mt-1"
          placeholder="e.g. BS Computer Science, BS Information Technology, etc."
        />
      </div>
    </div>
  );
}

