import { useState } from "react";
import { toast } from "sonner";
import { deleteAnnouncement } from "../_actions";
import { AnnouncementForm } from "./announcement-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExtendedAnnouncement } from "@/types/announcement";


interface AnnouncementListProps {
  announcements: ExtendedAnnouncement[] | [];
  userId: string;
  onUpdate: () => void;
}

export function AnnouncementList({ announcements, userId, onUpdate }: Readonly<AnnouncementListProps>) {
  const [editingAnnouncement, setEditingAnnouncement] = useState<ExtendedAnnouncement | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteAnnouncement({ userId, id });
      if (!result.success) {
        throw new Error(result.message);
      }
      toast.success("Announcement deleted!");
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  const getLevelColor = (level: "INFO" | "WARNING" | "CRITICAL") => {
    switch (level) {
    case "INFO":
      return "bg-blue-100 text-blue-800";
    case "WARNING":
      return "bg-yellow-100 text-yellow-800";
    case "CRITICAL":
      return "bg-red-100 text-red-800";
    }
  };

  if (editingAnnouncement) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setEditingAnnouncement(null)}>
          Back to List
        </Button>
        <AnnouncementForm
          userId={userId}
          initialData={editingAnnouncement}
          onSuccess={() => {
            setEditingAnnouncement(null);
            onUpdate();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <Card key={announcement.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{announcement.title}</h3>
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${getLevelColor(announcement.level)}`}>
                  {announcement.level}
                </span>
              </div>
              <p className="text-sm text-gray-500">{announcement.content}</p>
              <p className="text-xs text-gray-400">
                Published by {announcement.publishedBy.firstName} {announcement.publishedBy.lastName} on{" "}
                {new Date(announcement.publishedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingAnnouncement(announcement)}
              >
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-neutral-2">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this announcement? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(announcement.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}