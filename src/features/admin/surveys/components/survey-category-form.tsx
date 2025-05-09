'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CgSpinner } from "react-icons/cg";
import { FaSave } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createSurveyCategory, updateSurveyCategory } from "@/features/admin/surveys/actions";
import { createSurveyCategorySchema, type CreateSurveyCategoryType } from "@/schema/survey.schema";
import { useUserStore } from "@/stores/user.store";
import useToast from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SurveyCategoryFormProps {
  initialData?: CreateSurveyCategoryType & { id: string };
  onSuccess?: () => void;
}

export function SurveyCategoryForm({ initialData, onSuccess }: Readonly<SurveyCategoryFormProps>) {
  const { userId } = useUserStore();
  
  const form = useForm<CreateSurveyCategoryType>({
    resolver: zodResolver(createSurveyCategorySchema),
    defaultValues: initialData ?? {
      name: "",
      description: "",
      question1: "",
      question2: "",
      question3: "",
      question4: "",
    }
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: CreateSurveyCategoryType) => {
      if (initialData?.id) {
        return updateSurveyCategory({
          userId: userId as string,
          id: initialData.id,
          ...data
        });
      }
      return createSurveyCategory({
        userId: userId as string,
        ...data
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        useToast({
          type: "success",
          title: "Success",
          message: initialData ? "Survey category updated" : "Survey category created"
        });
        form.reset();
        onSuccess?.();
      } else {
        useToast({
          type: "error",
          title: "Error",
          message: response.message ?? "Something went wrong"
        });
      }
    },
  });

  return (
    <Card className="bg-neutral-2">
      <CardHeader>
        <CardTitle>{initialData ? "Edit Survey Category" : "Create Survey Category"}</CardTitle>
      </CardHeader>
      <CardContent className="bg-neutral-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter category description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <Label>Survey Questions</Label>
              {[1, 2, 3, 4].map((num) => (
                <FormField
                  key={num}
                  control={form.control}
                  name={`question${num}` as keyof CreateSurveyCategoryType}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question {num}</FormLabel>
                      <FormControl>
                        <Input placeholder={`Enter question ${num}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <Button 
              type="submit" 
              disabled={isPending}
              className={cn("w-full", isPending ? "bg-gray-600" : "bg-primary")}
            >
              {isPending ? (
                <span className="flex items-center justify-center">
                  <CgSpinner className="mr-2 animate-spin" /> 
                  {initialData ? "Updating..." : "Creating..."}
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <FaSave className="mr-2" /> 
                  {initialData ? "Update Category" : "Create Category"}
                </span>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}