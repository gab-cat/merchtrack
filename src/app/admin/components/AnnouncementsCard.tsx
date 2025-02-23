'use client';

import { Bell, Info, AlertTriangle, AlertOctagon } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExtendedAnnouncement } from "@/types/announcement";

interface AnnouncementsCardProps {
  announcements: ExtendedAnnouncement[];
}

export function AnnouncementsCard({ announcements }: Readonly<AnnouncementsCardProps>) {
  const getLevelStyles = (level: "INFO" | "WARNING" | "CRITICAL") => {
    switch (level) {
    case "INFO":
      return {
        border: "border-blue-500",
        bg: "hover:bg-blue-50",
        icon: <Info className="size-5 text-blue-500" />,
        iconBg: "bg-blue-100"
      };
    case "WARNING":
      return {
        border: "border-yellow-500",
        bg: "hover:bg-yellow-50",
        icon: <AlertTriangle className="size-5 text-yellow-500" />,
        iconBg: "bg-yellow-100"
      };
    case "CRITICAL":
      return {
        border: "border-red-500",
        bg: "hover:bg-red-50",
        icon: <AlertOctagon className="size-5 text-red-500" />,
        iconBg: "bg-red-100"
      };
    }
  };

  return (
    <Card className="bg-white shadow-none transition-all duration-300 ease-in-out hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold tracking-tight text-gray-900">
          <Bell className="mr-2 size-5 text-blue-500" /> Announcements
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-4 bg-neutral-2">
        {announcements.map((announcement) => {
          const styles = getLevelStyles(announcement.level);
          return (
            <Dialog key={announcement.id}>
              <DialogTrigger asChild>
                <Alert 
                  className={`mb-4 cursor-pointer border-l-4 bg-neutral-2 ${styles.border} ${styles.bg} relative`}
                >
                  <div className={`absolute left-4 top-4 rounded-full p-1.5 ${styles.iconBg}`}>
                    {styles.icon}
                  </div>
                  <div className="pl-12">
                    <AlertTitle className="flex items-center justify-between text-base font-semibold tracking-tight text-gray-900">
                      {announcement.title}
                      <span className="text-xs font-normal text-gray-500">
                        {format(new Date(announcement.createdAt), 'MMM d, yyyy')}
                      </span>
                    </AlertTitle>
                    <AlertDescription className="mt-1 line-clamp-2 text-xs text-gray-600">
                      {announcement.content}
                    </AlertDescription>
                  </div>
                </Alert>
              </DialogTrigger>
              <DialogContent className="bg-neutral-2 p-6">
                <DialogHeader>
                  <div className={`mb-4 inline-flex w-max items-center gap-2 rounded-full px-3 py-1 text-sm ${styles.iconBg}`}>
                    {styles.icon}
                    <span className="font-medium">{announcement.level}</span>
                  </div>
                  <DialogTitle className="mt-4">{announcement.title}</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">{announcement.content}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    <span>Created: {format(new Date(announcement.createdAt), 'MMM d, yyyy HH:mm')}</span>
                    {announcement.updatedAt !== announcement.createdAt && (
                      <span>Updated: {format(new Date(announcement.updatedAt), 'MMM d, yyyy HH:mm')}</span>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </CardContent>
    </Card>
  );
}
