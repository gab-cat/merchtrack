import { format } from "date-fns";
import { FaUser, FaUserCog, FaInfoCircle, FaCommentAlt, FaClock } from "react-icons/fa";
import { ExtendedLogs } from "@/types/logs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type LogDetailsModalProps = {
  log: ExtendedLogs | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogDetailsModal({ log, open, onOpenChange }: Readonly<LogDetailsModalProps>) {
  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto bg-white">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <FaInfoCircle className="size-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">{log.reason}</DialogTitle>
          </div>
          <DialogDescription className="ml-2 flex items-center gap-2 text-sm">
            <FaClock className="size-4 text-neutral-5" />
            {format(new Date(log.createdDate), "MMM d, yyyy HH:mm:ss")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6 grid gap-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className={cn(
              "rounded-lg border p-4 transition-all",
              "hover:border-primary/50 hover:shadow-sm"
            )}>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <FaUser className="size-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Affected User</h4>
                  <p className="text-muted-foreground text-sm">
                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                  </p>
                </div>
              </div>
            </div>

            <div className={cn(
              "rounded-lg border p-4 transition-all",
              "hover:border-primary/50 hover:shadow-sm"
            )}>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <FaUserCog className="size-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Created By</h4>
                  <p className="text-muted-foreground text-sm">
                    {log.createdBy ? `${log.createdBy.firstName} ${log.createdBy.lastName}` : 'System'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={cn(
            "rounded-lg border p-4 transition-all",
            "hover:border-primary/50 hover:shadow-sm"
          )}>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <FaInfoCircle className="size-4 text-purple-600" />
              </div>
              <h4 className="font-medium">System Details</h4>
            </div>
            <p className="text-muted-foreground whitespace-pre-wrap pl-11 text-sm">{log.systemText}</p>
          </div>

          <div className={cn(
            "rounded-lg border p-4 transition-all",
            "hover:border-primary/50 hover:shadow-sm"
          )}>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-full bg-amber-100 p-2">
                <FaCommentAlt className="size-4 text-amber-600" />
              </div>
              <h4 className="font-medium">User Message</h4>
            </div>
            <p className="text-muted-foreground pl-11 text-sm">{log.userText}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}