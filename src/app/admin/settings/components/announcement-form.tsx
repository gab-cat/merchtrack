"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, AlertTriangle, AlertOctagon } from "lucide-react";
import { toast } from "sonner";
import { createAnnouncement, updateAnnouncement } from "../_actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  level: z.enum(["INFO", "WARNING", "CRITICAL"]),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

interface AnnouncementFormProps {
  userId: string;
  onSuccess?: () => void;
  initialData?: {
    id: string;
    title: string;
    content: string;
    level: "INFO" | "WARNING" | "CRITICAL";
  };
}

export function AnnouncementForm({ userId, onSuccess, initialData }: Readonly<AnnouncementFormProps>) {
  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      level: initialData?.level || "INFO",
    },
  });

  const getLevelStyles = (level: "INFO" | "WARNING" | "CRITICAL") => {
    switch (level) {
    case "INFO":
      return {
        border: "border-blue-500",
        bg: "bg-blue-50",
        icon: <Info className="size-5 text-blue-500" />,
        text: "text-blue-700"
      };
    case "WARNING":
      return {
        border: "border-yellow-500",
        bg: "bg-yellow-50",
        icon: <AlertTriangle className="size-5 text-yellow-500" />,
        text: "text-yellow-700"
      };
    case "CRITICAL":
      return {
        border: "border-red-500",
        bg: "bg-red-50",
        icon: <AlertOctagon className="size-5 text-red-500" />,
        text: "text-red-700"
      };
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: AnnouncementFormValues) => {
      const action = initialData
        ? updateAnnouncement({ userId, id: initialData.id, ...values })
        : createAnnouncement({ userId, ...values, type: "NORMAL" });
      
      const result = await action;
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: () => {
      toast.success(initialData ? "Announcement updated!" : "Announcement created!");
      if (onSuccess) onSuccess();
      if (!initialData) {
        form.reset({
          title: "",
          content: "",
          level: "INFO",
        });
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    },
  });

  const watchedLevel = form.watch("level");
  const watchedTitle = form.watch("title");
  const watchedContent = form.watch("content");
  const styles = getLevelStyles(watchedLevel as "INFO" | "WARNING" | "CRITICAL");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Announcement" : "Create New Announcement"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((formData) => mutate(formData))} className="space-y-4">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INFO">
                          <span className="flex items-center gap-2"><Info className="size-4 text-blue-500" /> Info</span>
                        </SelectItem>
                        <SelectItem value="WARNING">
                          <span className="flex items-center gap-2"><AlertTriangle className="size-4 text-yellow-500" /> Warning</span>
                        </SelectItem>
                        <SelectItem value="CRITICAL">
                          <span className="flex items-center gap-2"><AlertOctagon className="size-4 text-red-500" /> Critical</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter announcement title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter announcement content"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : initialData ? "Update Announcement" : "Create Announcement"}
              </Button>
            </form>
          </Form>

          <div className="space-y-4">
            <h3 className="font-medium">Preview</h3>
            <div className={`rounded-lg border p-4 ${styles.bg} ${styles.border}`}>
              <div className="flex items-start gap-3">
                <div className="mt-1">{styles.icon}</div>
                <div>
                  <h4 className={`font-medium ${styles.text}`}>
                    {watchedTitle || "Announcement Title"}
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    {watchedContent || "Announcement content will appear here"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}