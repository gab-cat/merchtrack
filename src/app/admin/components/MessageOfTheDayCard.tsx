import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MessageOfTheDayCardProps {
  title: string;
  message: string;
}

export function MessageOfTheDayCard({ title, message }: Readonly<MessageOfTheDayCardProps>) {
  return (
    <Card className="bg-white shadow-none transition-all duration-300 ease-in-out hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold tracking-tight text-gray-900">
          <MessageSquare className="mr-2 size-5 text-primary-500" /> Message of the Day
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-4">
        <Alert className="border-l-4 border-primary-500">
          <AlertTitle className="text-gray-900">{title}</AlertTitle>
          <AlertDescription className="mt-2 text-gray-600">{message}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
