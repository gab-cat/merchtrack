import { MdInbox, MdOutbox } from "react-icons/md";
import { cn } from "@/lib/utils";
import { ExtendedMessage } from "@/types/messages";

interface MessageTabsProps {
  activeTab: "inbox" | "sent";
  onTabChange: (tab: "inbox" | "sent") => void;
  inboxCount?: number;
  sentCount?: number;
  handleMessageSelect: (message: ExtendedMessage | null) => void;
}

const tabs = [
  { id: "inbox", label: "Inbox", icon: MdInbox },
  { id: "sent", label: "Sent", icon: MdOutbox },
] as const;

export default function MessageTabs({ activeTab, onTabChange, inboxCount, sentCount, handleMessageSelect }: Readonly<MessageTabsProps>) {
  const handleTabChange = (tab: "inbox" | "sent") => {
    onTabChange(tab);
    handleMessageSelect(null);
  };
  return (
    <div className="mb-4 flex space-x-4 border-b">
      {tabs.map((tab) => {
        const count = tab.id === "inbox" ? inboxCount : sentCount;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "flex items-center space-x-2 border-b-2 px-4 py-2 text-sm font-medium",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            )}
          >
            <Icon className="size-5" />
            <span>{tab.label}</span>
            {count !== undefined && (
              <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
