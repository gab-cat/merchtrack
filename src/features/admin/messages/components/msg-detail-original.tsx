
import { MdEmail } from "react-icons/md";
import { manilaTime } from "@/utils/formatTime";
import { useMessageQuery } from "@/hooks/messages.hooks";

interface OriginalMessageProps {
  messageId: string;
}

export default function OriginalMessage({ messageId }: Readonly<OriginalMessageProps>) {
  const { data: message } = useMessageQuery(messageId, true);

  if (!message) {
    return null;
  }

  return (
    <div className="mt-6 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
      <h3 className="flex items-center text-lg font-semibold text-gray-700">
        <MdEmail className="mr-2" />
        Original Message
      </h3>
      <div>
        <div 
          key={message.id} 
          className="space-y-4">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <MdEmail className="mr-2 size-4" />
              {message.email}
            </span>
            <span className="flex items-center">
              {manilaTime.dateTime(message.createdAt)}
            </span>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="whitespace-pre-wrap text-gray-700">{message.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
