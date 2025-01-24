import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Announcement {
  id: number;
  title: string;
  description: string;
}

interface AnnouncementsCardProps {
  announcements: Announcement[];
}

export function AnnouncementsCard({ announcements }: Readonly<AnnouncementsCardProps>) {
  return (
    <Card className="bg-white shadow-none transition-all duration-300 ease-in-out hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold tracking-tight text-gray-900">
          <Bell className="mr-2 size-5 text-blue-500" /> Announcements
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-4">
        {announcements.map((announcement) => (
          <Alert key={announcement.id} className="mb-4 border-l-4 border-blue-500">
            <AlertTitle className="text-base font-semibold tracking-tight text-gray-900">{announcement.title}</AlertTitle>
            <AlertDescription className="text-xs text-gray-600">{announcement.description}</AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
