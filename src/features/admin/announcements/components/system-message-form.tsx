"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createAnnouncement } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SystemMessageFormProps {
  userId: string;
  onSuccess?: () => void;
}

export function SystemMessageForm({ userId, onSuccess }: Readonly<SystemMessageFormProps>) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createAnnouncement({
        userId,
        title,
        content,
        type: "SYSTEM",
        level: "INFO"
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      toast.success("Message of the day updated!");
      if (onSuccess) onSuccess();
      setTitle("");
      setContent("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Message of the Day</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter message title"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">Message</label>
            <Textarea
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your message"
              required
              rows={4}
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Update Message"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}