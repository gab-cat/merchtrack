import { Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MessageOfTheDayCardProps {
  title: string;
  message: string;
}

export function MessageOfTheDayCard({ title, message }: MessageOfTheDayCardProps) {
  return (
    <Card className="bg-white shadow-none transition-all duration-300 ease-in-out hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold tracking-tight text-gray-900">
          <Megaphone className="mr-2 size-5 text-green-500" /> Message of the Day
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-2">
        <h3 className="mb-2 text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">{message}</p>
      </CardContent>
    </Card>
  );
}
